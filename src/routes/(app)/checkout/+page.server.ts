import { collections } from '$lib/server/database';
import { paymentMethods } from '$lib/server/payment-methods';
import { COUNTRY_ALPHA2S } from '$lib/types/Country';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { bech32 } from 'bech32';
import { createOrder } from '$lib/server/orders';
import { emailsEnabled } from '$lib/server/email';
import { runtimeConfig } from '$lib/server/runtime-config';
import { vatRates } from '$lib/server/vat-rates';
import { checkCartItems, getCartFromDb } from '$lib/server/cart.js';
import { userIdentifier } from '$lib/server/user.js';
import { POS_ROLE_ID } from '$lib/types/User.js';

export async function load({ parent, locals }) {
	const parentData = await parent();

	if (parentData.cart) {
		try {
			await checkCartItems(parentData.cart, { user: userIdentifier(locals) });
		} catch (err) {
			throw redirect(303, '/cart');
		}
	}

	return {
		paymentMethods: paymentMethods(),
		emailsEnabled,
		deliveryFees: runtimeConfig.deliveryFees,
		vatRates: Object.fromEntries(COUNTRY_ALPHA2S.map((country) => [country, vatRates[country]])),
		isPosUser: locals.user?.role === POS_ROLE_ID
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		if (!paymentMethods().length) {
			throw error(500, 'No payment methods configured for the bootik');
		}
		const cart = await getCartFromDb({ user: userIdentifier(locals) });

		if (!cart?.items.length) {
			throw error(400, 'Cart is empty');
		}

		const products = await collections.products
			.find({
				_id: { $in: cart.items.map((item) => item.productId) }
			})
			.toArray();

		const byId = Object.fromEntries(products.map((product) => [product._id, product]));

		cart.items = cart.items.filter((item) => !!byId[item.productId]);

		if (!cart?.items.length) {
			throw error(400, 'Cart is empty');
		}

		const formData = await request.formData();

		const isDigital = products.every((product) => !product.shipping);

		const shipping = isDigital
			? null
			: z
					.object({
						firstName: z.string().min(1),
						lastName: z.string().min(1),
						address: z.string().min(1),
						city: z.string().min(1),
						state: z.string().optional(),
						zip: z.string().min(1),
						country: z.enum(COUNTRY_ALPHA2S)
					})
					.parse(Object.fromEntries(formData));

		const notifications = z
			.object({
				paymentStatusNPUB: z
					.string()
					.startsWith('npub')
					.refine((npubAddress) => bech32.decodeUnsafe(npubAddress, 90)?.prefix === 'npub', {
						message: 'Invalid npub address'
					})
					.optional(),
				paymentStatusEmail: z.string().email().optional()
			})
			.parse({
				paymentStatusNPUB: formData.get('paymentStatusNPUB') || undefined,
				paymentStatusEmail: formData.get('paymentStatusEmail') || undefined
			});

		const npubAddress = notifications?.paymentStatusNPUB;
		const email = notifications?.paymentStatusEmail;

		// Remove empty string
		if (shipping && !shipping.state) {
			delete shipping.state;
		}

		const { paymentMethod, discountAmount, discountType, discountJustification } = z
			.object({
				paymentMethod: z.enum([paymentMethods()[0], ...paymentMethods().slice(1)]),
				discountAmount: z.coerce.number().optional(),
				discountType: z.enum(['fiat', 'percentage']).optional(),
				discountJustification: z.string().optional()
			})
			.parse(Object.fromEntries(formData));

		const orderId = await createOrder(
			cart.items.map((item) => ({
				quantity: item.quantity,
				product: byId[item.productId],
				...(item.customPrice && {
					customPrice: { amount: item.customPrice.amount, currency: item.customPrice.currency }
				})
			})),
			paymentMethod,
			{
				user: {
					sessionId: locals.sessionId,
					userId: locals.user?._id,
					login: locals.user?.login,
					role: locals.user?.role
				},
				notifications: {
					paymentStatus: {
						npub: npubAddress,
						email
					}
				},
				cart,
				shippingAddress: shipping,
				vatCountry: shipping?.country ?? locals.countryCode,
				...(locals.user?.role === POS_ROLE_ID && {
					discount: {
						amount: discountAmount,
						type: discountType,
						justification: discountJustification
					}
				})
			}
		);

		throw redirect(303, `/order/${orderId}`);
	}
};
