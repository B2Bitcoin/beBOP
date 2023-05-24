import type { Order } from '$lib/types/Order';
import { ObjectId, type ChangeStreamDocument } from 'mongodb';
import { collections } from './database';
import { Lock } from './lock';

const lock = new Lock('order-notifications');

// todo: resume changestream on restart if possible
collections.orders
	.watch(
		[
			{
				// Watch on updateDescription.updatedFields['payment.status'] change
				$match: {
					$expr: {
						$not: {
							$not: [
								{
									$getField: { input: '$updateDescription.updatedFields', field: 'payment.status' }
								}
							]
						}
					}
				}
			}
		],
		{
			fullDocument: 'updateLookup'
		}
	)
	.on('change', (ev) => handleChanges(ev).catch(console.error));

async function handleChanges(change: ChangeStreamDocument<Order>): Promise<void> {
	if (
		!lock.ownsLock ||
		!('fullDocument' in change) ||
		!change.fullDocument ||
		!change.fullDocument.notifications?.paymentStatus?.npub
	) {
		return;
	}

	const { npub } = change.fullDocument.notifications.paymentStatus;

	await collections.nostrNotifications.insertOne({
		_id: new ObjectId(),
		createdAt: new Date(),
		updatedAt: new Date(),
		content: `Order #${change.fullDocument.number} ${change.fullDocument.payment.status}, see ${change.fullDocument.url}`,
		dest: npub
	});
}
