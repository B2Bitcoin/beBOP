import { collections } from '$lib/server/database';
import { paymentMethods } from '$lib/server/payment-methods';
import { COUNTRY_ALPHA2S, type CountryAlpha2 } from '$lib/types/Country';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { createOrder } from '$lib/server/orders';
import { emailsEnabled } from '$lib/server/email';
import { runtimeConfig } from '$lib/server/runtime-config';
import { checkCartItems, getCartFromDb } from '$lib/server/cart.js';
import { userIdentifier, userQuery } from '$lib/server/user.js';
import { POS_ROLE_ID } from '$lib/types/User.js';
import { zodNpub } from '$lib/server/nostr.js';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { rateLimit } from '$lib/server/rateLimit.js';

export async function load({ parent, locals }) {
	const parentData = await parent();

	if (parentData.cart) {
		try {
			await checkCartItems(parentData.cart, { user: userIdentifier(locals) });
		} catch (err) {
			throw redirect(303, '/cart');
		}
	}
	const personalInfoConnected = await collections.personalInfo.findOne(
		userQuery(userIdentifier(locals)),
		{
			sort: { _id: -1 }
		}
	);
	return {
		paymentMethods: paymentMethods(locals.user?.roleId),
		emailsEnabled,
		collectIPOnDeliverylessOrders: runtimeConfig.collectIPOnDeliverylessOrders,
		personalInfoConnected: {
			firstName: personalInfoConnected?.firstName,
			lastName: personalInfoConnected?.lastName,
			address: personalInfoConnected?.address,
			_id: personalInfoConnected?._id.toString(),
			newsletter: personalInfoConnected?.newsletter
		},
		isBillingAddressMandatory: runtimeConfig.isBillingAddressMandatory,
		displayNewsletterCommercialProspection: runtimeConfig.displayNewsletterCommercialProspection
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		const methods = paymentMethods(locals.user?.roleId);
		if (!methods.length) {
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
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			if (value) {
				set(json, key, value);
			}
		}

		const isDigital = products.every((product) => !product.shipping);

		const shippingInfo = isDigital
			? null
			: z
					.object({
						shipping: z.object({
							firstName: z.string().min(1),
							lastName: z.string().min(1),
							address: z.string().min(1),
							city: z.string().min(1),
							state: z.string().optional(),
							zip: z.string().min(1),
							country: z.enum([...COUNTRY_ALPHA2S] as [CountryAlpha2, ...CountryAlpha2[]])
						})
					})
					.parse(json);

		const billingInfo = json.billing
			? z
					.object({
						billing: z.object({
							firstName: z.string().min(1),
							lastName: z.string().min(1),
							address: z.string().min(1),
							city: z.string().min(1),
							state: z.string().optional(),
							zip: z.string().min(1),
							country: z.enum([...COUNTRY_ALPHA2S] as [CountryAlpha2, ...CountryAlpha2[]])
						})
					})
					.parse(json)
			: null;

		const notifications = z
			.object({
				paymentStatusNPUB: zodNpub().optional(),
				paymentStatusEmail: z.string().email().optional()
			})
			.parse({
				paymentStatusNPUB: formData.get('paymentStatusNPUB') || undefined,
				paymentStatusEmail: formData.get('paymentStatusEmail') || undefined
			});

		const npubAddress = notifications?.paymentStatusNPUB;
		const email = notifications?.paymentStatusEmail;

		// Remove empty string
		if (shippingInfo && !shippingInfo.shipping.state) {
			delete shippingInfo.shipping.state;
		}
		const newsletterProspection = runtimeConfig.displayNewsletterCommercialProspection
			? z
					.object({
						newsletter: z.object({
							seller: z.boolean({ coerce: true }).default(false),
							partner: z.boolean({ coerce: true }).default(false)
						})
					})
					.parse(json)
			: null;

		const { paymentMethod, discountAmount, discountType, discountJustification } = z
			.object({
				paymentMethod: z.enum([methods[0], ...methods.slice(1)]),
				discountAmount: z.coerce.number().optional(),
				discountType: z.enum(['fiat', 'percentage']).optional(),
				discountJustification: z.string().optional()
			})
			.parse(Object.fromEntries(formData));

		if (discountAmount && (!discountType || !discountJustification)) {
			throw error(400, 'Discount type and justification are required');
		}

		let isFreeVat: boolean | undefined;
		let reasonFreeVat: string | undefined;

		if (locals.user?.roleId === POS_ROLE_ID) {
			const vatDetails = z
				.object({
					isFreeVat: z.coerce.boolean().optional(),
					reasonFreeVat: z.string().optional()
				})
				.parse(Object.fromEntries(formData));

			isFreeVat = vatDetails.isFreeVat;
			reasonFreeVat = vatDetails.reasonFreeVat;
		}

		if (isFreeVat && !reasonFreeVat) {
			throw error(400, 'Reason for free VAT is required');
		}
		if (
			runtimeConfig.displayNewsletterCommercialProspection &&
			(newsletterProspection?.newsletter.partner || newsletterProspection?.newsletter.seller)
		) {
			await collections.personalInfo.updateOne(
				{
					$or: [{ npub: npubAddress }, { email: email }]
				},
				{
					$set: {
						newsletter: newsletterProspection.newsletter,
						...(npubAddress && { npub: npubAddress }),
						...(email && { email: email }),
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
		}

		const agreements = z
			.object({
				allowCollectIP: z.boolean({ coerce: true }).default(false),
				isOnlyDeposit: z.boolean({ coerce: true }).default(false)
			})
			.parse({
				allowCollectIP: formData.get('allowCollectIP'),
				isOnlyDeposit: formData.get('isOnlyDeposit')
			});

		if (!agreements.allowCollectIP && runtimeConfig.collectIPOnDeliverylessOrders && isDigital) {
			throw error(400, 'You must allow the collection of your IP address');
		}

		if (
			!agreements.isOnlyDeposit &&
			cart.items.some(
				(item) =>
					item.depositPercentage !== undefined &&
					item.depositPercentage !== null &&
					(item.depositPercentage ?? 0) < 100 &&
					(item.customPrice || byId[item.productId].price).amount > 0
			)
		) {
			throw error(
				400,
				'You must acknowledge that you are only paying a deposit and will have to pay the rest later'
			);
		}

		rateLimit(locals.clientIp, 'email', 10, { minutes: 1 });

		const orderId = await createOrder(
			cart.items.map((item) => ({
				quantity: item.quantity,
				product: byId[item.productId],
				...(item.customPrice && {
					customPrice: { amount: item.customPrice.amount, currency: item.customPrice.currency }
				}),
				depositPercentage: item.depositPercentage
			})),
			paymentMethod,
			{
				user: {
					sessionId: locals.sessionId,
					userId: locals.user?._id,
					userLogin: locals.user?.login,
					userRoleId: locals.user?.roleId
				},
				notifications: {
					paymentStatus: {
						npub: npubAddress,
						email
					}
				},
				cart,
				shippingAddress: shippingInfo?.shipping,
				billingAddress: billingInfo?.billing || shippingInfo?.shipping,
				vatCountry:
					shippingInfo?.shipping?.country ?? locals.countryCode ?? runtimeConfig.vatCountry,
				...(locals.user?.roleId === POS_ROLE_ID && isFreeVat && { reasonFreeVat }),
				...(locals.user?.roleId === POS_ROLE_ID &&
					discountAmount &&
					discountType &&
					discountJustification && {
						discount: {
							amount: discountAmount,
							type: discountType,
							justification: discountJustification
						}
					}),
				...(agreements.allowCollectIP && { clientIp: locals.clientIp })
			}
		);

		throw redirect(303, `/order/${orderId}`);
	}
};
