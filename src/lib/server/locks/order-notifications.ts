import type { Order } from '$lib/types/Order';
import { ObjectId, type ChangeStreamDocument, Timestamp } from 'mongodb';
import { collections, withTransaction } from '../database';
import { Lock } from '../lock';
import { ORIGIN } from '$env/static/private';
import { Kind } from 'nostr-tools';
import { toBitcoins } from '$lib/utils/toBitcoins';
import { getUnixTime, subHours } from 'date-fns';

const lock = new Lock('order-notifications');

const processingIds = new Set<string>();

const watch = [
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
];

let changeStream = collections.orders
	.watch(watch, {
		fullDocument: 'updateLookup',
		startAfter:
			(await collections.runtimeConfig
				.findOne({ _id: 'orderNotificationsResumeToken' })
				.then((val) => val?.data)) || undefined
	})
	.on('change', (ev) => handleChanges(ev).catch(console.error))
	.once('error', async () => {
		// In case it couldn't resume correctly, start from 1 hour ago
		await changeStream.close().catch(console.error);

		changeStream = collections.orders
			.watch(watch, {
				fullDocument: 'updateLookup',
				startAtOperationTime: Timestamp.fromBits(getUnixTime(subHours(new Date(), 1)), 0)
			})
			.on('change', (ev) => handleChanges(ev).catch(console.error));
	});

async function handleChanges(change: ChangeStreamDocument<Order>): Promise<void> {
	if (!lock.ownsLock || !('fullDocument' in change) || !change.fullDocument) {
		return;
	}

	await handleOrderNotification(change.fullDocument);
	await collections.runtimeConfig.updateOne(
		{ _id: 'orderNotificationsResumeToken' },
		{ $set: { data: change._id, updatedAt: new Date() } },
		{ upsert: true }
	);
}

async function handleOrderNotification(order: Order): Promise<void> {
	if (
		processingIds.has(order._id.toString()) ||
		order.lastPaymentStatusNotified === order.payment.status
	) {
		return;
	}

	try {
		processingIds.add(order._id.toString());

		const updatedOrder = await collections.orders.findOne({
			_id: order._id
		});
		if (!updatedOrder || updatedOrder.lastPaymentStatusNotified === updatedOrder.payment.status) {
			return;
		}
		order = updatedOrder;

		const { npub, email } = order.notifications.paymentStatus;

		await withTransaction(async (session) => {
			if (npub) {
				let content = `Order #${order.number} ${order.payment.status}, see ${ORIGIN}/order/${order._id}`;

				if (order.payment.status === 'pending') {
					if (order.payment.method === 'bitcoin') {
						content += `\n\nPlease send ${toBitcoins(
							order.totalPrice.amount,
							order.totalPrice.currency
						).toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC to ${
							order.payment.address
						}`;
					} else if (order.payment.method === 'lightning') {
						content += `\n\nPlease pay this invoice: ${order.payment.address}`;
					}
				}

				await collections.nostrNotifications.insertOne(
					{
						_id: new ObjectId(),
						createdAt: new Date(),
						kind: Kind.EncryptedDirectMessage,
						updatedAt: new Date(),
						content,
						dest: npub
					},
					{
						session
					}
				);
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

				await collections.emailNotifications.insertOne(
					{
						_id: new ObjectId(),
						createdAt: new Date(),
						updatedAt: new Date(),
						subject: `Order #${order.number}`,
						htmlContent,
						dest: email
					},
					{
						session
					}
				);
			}

			await collections.orders.updateOne(
				{
					_id: order._id
				},
				{
					$set: {
						lastPaymentStatusNotified: order.payment.status
					}
				},
				{
					session
				}
			);
		});
	} finally {
		processingIds.delete(order._id.toString());
	}
}
