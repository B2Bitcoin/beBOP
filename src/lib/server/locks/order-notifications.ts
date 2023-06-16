import type { Order } from '$lib/types/Order';
import { ObjectId, type ChangeStreamDocument } from 'mongodb';
import { collections } from '../database';
import { Lock } from '../lock';
import { ORIGIN } from '$env/static/private';

const lock = new Lock('order-notifications');

// todo: resume changestream on restart if possible
collections.orders
	.watch(
		[
			{
				// Watch on updateDescription.updatedFields['payment.status'] change, or when
				// document inserted
				$match: {
					$or: [
						{
							$expr: {
								$not: {
									$not: [
										{
											$getField: {
												input: '$updateDescription.updatedFields',
												field: 'payment.status'
											}
										}
									]
								}
							}
						},
						{
							operationType: 'insert'
						}
					]
				}
			}
		],
		{
			fullDocument: 'updateLookup'
		}
	)
	.on('change', (ev) => handleChanges(ev).catch(console.error));

async function handleChanges(change: ChangeStreamDocument<Order>): Promise<void> {
	if (!lock.ownsLock || !('fullDocument' in change) || !change.fullDocument) {
		return;
	}

	const order = change.fullDocument;

	const { npub, email } = order.notifications.paymentStatus;

	if (npub) {
		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			content: `Order #${order.number} ${order.payment.status}, see ${ORIGIN}/order/${order._id}`,
			dest: npub
		});
	}

	if (email) {
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Order #${order.number} ${order.payment.status}`,
			htmlContent: `Order #${order.number} status changed to ${order.payment.status}, see <a href="${ORIGIN}/order/${order._id}">${ORIGIN}/order/${order._id}</a>`,
			dest: email
		});
	}
}
