import { getNewAddress, orderAddressLabel } from '$lib/server/bitcoin';
import { collections, withTransaction } from '$lib/server/database';
import { lndCreateInvoice } from '$lib/server/lightning.js';
import { paymentMethods } from '$lib/server/payment-methods.js';
import { COUNTRY_ALPHA3S } from '$lib/types/Country';
import { error, redirect } from '@sveltejs/kit';
import { addHours, differenceInSeconds, subSeconds } from 'date-fns';
import { z } from 'zod';
import { bech32 } from 'bech32';
import { ORIGIN } from '$env/static/private';
import { toSatoshis } from '$lib/utils/toSatoshis.js';
import { runtimeConfig } from '$lib/server/runtime-config.js';

export function load() {
	return {
		paymentMethods
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		if (!paymentMethods.length) {
			throw error(500, 'No payment methods configured for the bootik');
		}
		const cart = await collections.carts.findOne({ sessionId: locals.sessionId });

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

		if (!products.every((product) => product.price.currency === products[0].price.currency)) {
			throw error(400, 'Cart contains products with different currencies');
		}

		if (
			products.some(
				(product) =>
					product.availableDate && !product.preorder && product.availableDate > new Date()
			)
		) {
			throw error(400, 'Cart contains products that are not yet available');
		}

		const isDigital = products.every((product) => !product.shipping);

		const formData = await request.formData();

		const npubAddress = z
			.string()
			.startsWith('npub')
			.refine((npubAddress) => bech32.decodeUnsafe(npubAddress, 90)?.prefix === 'npub', {
				message: 'Invalid npub address'
			})
			.parse(formData.get('paymentStatusNPUB'));

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
						country: z.enum(COUNTRY_ALPHA3S)
					})
					.parse(Object.fromEntries(formData));

		// Remove empty string
		if (shipping && !shipping.state) {
			delete shipping.state;
		}

		const paymentMethod = z
			.object({
				paymentMethod: z.enum([paymentMethods[0], ...paymentMethods.slice(1)])
			})
			.parse(Object.fromEntries(formData)).paymentMethod;

		let totalSatoshis = 0;

		for (const item of cart.items) {
			const product = byId[item.productId];

			const price = parseFloat(product.price.amount.toString());
			const quantity = item.quantity;

			totalSatoshis += toSatoshis(price * quantity, product.price.currency);
		}

		const orderId = crypto.randomUUID();

		const subscriptions = cart.items.filter((item) => byId[item.productId].type === 'subscription');

		for (const subscription of subscriptions) {
			const product = byId[subscription.productId];

			if (subscription.quantity > 1) {
				throw error(
					400,
					'Cannot order more than one of a subscription at a time for product: ' + product.name
				);
			}

			const existingSubscription = await collections.paidSubscriptions.findOne({
				npub: npubAddress,
				productId: product._id
			});

			if (existingSubscription) {
				if (
					subSeconds(existingSubscription.paidUntil, runtimeConfig.subscriptionReminderSeconds) >
					new Date()
				) {
					throw error(
						400,
						'You already have an active subscription for this product: ' + product.name
					);
				}
			}

			if (
				await collections.orders.countDocuments(
					{
						'notifications.paymentStatus.npub': npubAddress,
						'items.product._id': product._id,
						'payment.status': 'pending'
					},
					{ limit: 1 }
				)
			) {
				throw error(400, 'You already have a pending order for this product: ' + product.name);
			}
		}

		await withTransaction(async (session) => {
			const res = await collections.runtimeConfig.findOneAndUpdate(
				{ _id: 'orderNumber' },
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				{ $inc: { data: 1 } as any },
				{ upsert: true, session, returnDocument: 'after' }
			);

			if (!res.value) {
				throw new Error('Failed to increment order number');
			}

			const orderNumber = res.value.data as number;

			const expiresAt = addHours(new Date(), 2);

			await collections.orders.insertOne(
				{
					_id: orderId,
					number: orderNumber,
					sessionId: locals.sessionId,
					createdAt: new Date(),
					updatedAt: new Date(),
					items: cart.items.map((item) => ({
						product: byId[item.productId],
						quantity: item.quantity
					})),
					...(shipping && { shippingAddress: shipping }),
					totalPrice: {
						amount: totalSatoshis,
						currency: 'SAT'
					},
					payment: {
						method: paymentMethod,
						status: 'pending',
						...(paymentMethod === 'bitcoin'
							? { address: await getNewAddress(orderAddressLabel(orderId)) }
							: await (async () => {
									const invoice = await lndCreateInvoice(
										totalSatoshis,
										differenceInSeconds(expiresAt, new Date()),
										`${ORIGIN}/order/${orderId}`
									);

									return {
										address: invoice.payment_request,
										invoiceId: invoice.r_hash
									};
							  })()),
						expiresAt
					},
					notifications: {
						paymentStatus: {
							npub: npubAddress
						}
					}
				},
				{ session }
			);

			await collections.carts.deleteOne({ _id: cart._id }, { session });
		});

		throw redirect(303, `/order/${orderId}`);
	}
};
