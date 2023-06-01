import type { Order } from '$lib/types/Order';
import type { ClientSession } from 'mongodb';
import { collections } from './database';
import { add, max } from 'date-fns';
import { runtimeConfig } from './runtime-config';
import { generateSubscriptionNumber } from './subscriptions';

export async function generateOrderNumber(): Promise<number> {
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
								[runtimeConfig.subscriptionDuration]: 1
							}),
							updatedAt: new Date()
						},
						$unset: { canceledAt: 1 }
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
						paidUntil: add(new Date(), { [runtimeConfig.subscriptionDuration]: 1 }),
						createdAt: new Date(),
						updatedAt: new Date()
					},
					{ session }
				);
			}
		}
	}
}
