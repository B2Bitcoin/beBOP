import type { Order } from '$lib/types/Order';
import type { ClientSession } from 'mongodb';
import { collections, withTransaction } from './database';
import { add, addHours, differenceInSeconds, max, subSeconds } from 'date-fns';
import { runtimeConfig } from './runtime-config';
import { generateSubscriptionNumber } from './subscriptions';
import type { Product } from '$lib/types/Product';
import { error } from '@sveltejs/kit';
import { toSatoshis } from '$lib/utils/toSatoshis';
import { currentWallet, getNewAddress, orderAddressLabel } from './bitcoin';
import { lndCreateInvoice } from './lightning';
import { ORIGIN } from '$env/static/private';

async function generateOrderNumber(): Promise<number> {
	const res = await collections.runtimeConfig.findOneAndUpdate(
		{ _id: 'orderNumber' },
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ $inc: { data: 1 } as any },
		{ upsert: true, returnDocument: 'after' }
	);

	if (!res.value) {
		throw new Error('Failed to increment order number');
	}

	return res.value.data as number;
}

export async function onOrderPaid(order: Order, session: ClientSession) {
	if (order.notifications.paymentStatus.npub) {
		const subscriptions = await collections.paidSubscriptions
			.find({
				npub: order.notifications.paymentStatus.npub,
				productId: { $in: order.items.map((item) => item.product._id) }
			})
			.toArray();
		const challenges = await collections.challenges.find({}).toArray();
		for (const challenge of challenges.filter(
			(chall) =>
				chall.mode === 'moneyAmount' && chall.beginsAt! < new Date() && chall.endsAt > new Date()
		)) {
			await collections.challenges.updateOne(
				{ _id: challenge._id },
				{
					$inc: {
						progress: toSatoshis(order.totalPrice.amount, order.totalPrice.currency)
					}
				},
				{ session }
			);
		}
		for (const subscription of order.items.filter((item) => item.product.type === 'subscription')) {
			const existingSubscription = subscriptions.find(
				(sub) => sub.productId === subscription.product._id
			);

			if (existingSubscription) {
				const result = await collections.paidSubscriptions.updateOne(
					{ _id: existingSubscription._id },
					{
						$set: {
							paidUntil: add(max([existingSubscription.paidUntil, new Date()]), {
								[`${runtimeConfig.subscriptionDuration}s`]: 1
							}),
							updatedAt: new Date(),
							notifications: []
						},
						$unset: { cancelledAt: 1 }
					},
					{ session }
				);

				if (!result.modifiedCount) {
					throw new Error('Failed to update subscription');
				}
			} else {
				await collections.paidSubscriptions.insertOne(
					{
						_id: crypto.randomUUID(),
						number: await generateSubscriptionNumber(),
						npub: order.notifications.paymentStatus.npub,
						productId: subscription.product._id,
						paidUntil: add(new Date(), { [`${runtimeConfig.subscriptionDuration}s`]: 1 }),
						createdAt: new Date(),
						updatedAt: new Date(),
						notifications: []
					},
					{ session }
				);
			}
		}
	}
}

export async function createOrder(
	items: Array<{ quantity: number; product: Product }>,
	paymentMethod: Order['payment']['method'],
	params: {
		sessionId: string;
		npub: string;
		shippingAddress: Order['shippingAddress'] | null;
		cb?: (session: ClientSession) => Promise<unknown>;
	}
): Promise<Order['_id']> {
	const products = items.map((item) => item.product);
	if (
		products.some(
			(product) => product.availableDate && !product.preorder && product.availableDate > new Date()
		)
	) {
		throw error(400, 'Cart contains products that are not yet available');
	}

	const isDigital = products.every((product) => !product.shipping);

	if (!isDigital && !params.shippingAddress) {
		throw error(400, 'Shipping address is required');
	}

	let totalSatoshis = 0;

	for (const item of items) {
		const price = parseFloat(item.product.price.amount.toString());
		const quantity = item.quantity;

		totalSatoshis += toSatoshis(price * quantity, item.product.price.currency);
	}

	const orderId = crypto.randomUUID();

	const subscriptions = items.filter((item) => item.product.type === 'subscription');

	for (const subscription of subscriptions) {
		const product = subscription.product;

		if (subscription.quantity > 1) {
			throw error(
				400,
				'Cannot order more than one of a subscription at a time for product: ' + product.name
			);
		}

		const existingSubscription = await collections.paidSubscriptions.findOne({
			npub: params.npub,
			productId: product._id
		});

		if (existingSubscription) {
			if (
				subSeconds(existingSubscription.paidUntil, runtimeConfig.subscriptionReminderSeconds) >
				new Date()
			) {
				throw error(
					400,
					'You already have an active subscription for this product: ' +
						product.name +
						', which is not due for renewal yet.'
				);
			}
		}

		if (
			await collections.orders.countDocuments(
				{
					'notifications.paymentStatus.npub': params.npub,
					'items.product._id': product._id,
					'payment.status': 'pending'
				},
				{ limit: 1 }
			)
		) {
			throw error(400, 'You already have a pending order for this product: ' + product.name);
		}
	}

	const orderNumber = await generateOrderNumber();

	await withTransaction(async (session) => {
		const expiresAt = addHours(new Date(), 2);

		await collections.orders.insertOne(
			{
				_id: orderId,
				number: orderNumber,
				sessionId: params.sessionId,
				createdAt: new Date(),
				updatedAt: new Date(),
				items,
				...(params.shippingAddress && { shippingAddress: params.shippingAddress }),
				totalPrice: {
					amount: totalSatoshis,
					currency: 'SAT'
				},
				payment: {
					method: paymentMethod,
					status: 'pending',
					...(paymentMethod === 'bitcoin'
						? {
								address: await getNewAddress(orderAddressLabel(orderId)),
								wallet: await currentWallet()
						  }
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
						npub: params.npub
					}
				}
			},
			{ session }
		);

		await params.cb?.(session);
	});

	return orderId;
}
