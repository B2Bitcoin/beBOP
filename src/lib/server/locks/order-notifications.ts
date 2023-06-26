import type { Order } from '$lib/types/Order';
import { ObjectId, type ChangeStreamDocument } from 'mongodb';
import { collections } from '../database';
import { Lock } from '../lock';
import { ORIGIN } from '$env/static/private';
import { Kind } from 'nostr-tools';
import { toBitcoins } from '$lib/utils/toBitcoins';

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
		let content = `Order #${order.number} ${order.payment.status}, see ${ORIGIN}/order/${order._id}`;

		if (order.payment.status === 'pending') {
			if (order.payment.method === 'bitcoin') {
				content += `\n\nPlease send ${toBitcoins(
					order.totalPrice.amount,
					order.totalPrice.currency
				).toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC to ${order.payment.address}`;
			} else if (order.payment.method === 'lightning') {
				content += `\n\nPlease pay this invoice: ${order.payment.address}`;
			}
		}

		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			kind: Kind.EncryptedDirectMessage,
			updatedAt: new Date(),
			content,
			dest: npub
		});
	}

	if (email) {
		let htmlContent = `<p>Order #${order.number} status changed to ${order.payment.status}, see <a href="${ORIGIN}/order/${order._id}">${ORIGIN}/order/${order._id}</a></p>`;

		if (order.payment.status === 'pending') {
			if (order.payment.method === 'bitcoin') {
				htmlContent += `<p>Please send ${toBitcoins(
					order.totalPrice.amount,
					order.totalPrice.currency
				).toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC to ${
					order.payment.address
				}</p>`;
			} else if (order.payment.method === 'lightning') {
				htmlContent += `<p>Please pay this invoice: ${order.payment.address}</p>`;
			}
		}

		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Order #${order.number}`,
			htmlContent,
			dest: email
		});
	}
}
