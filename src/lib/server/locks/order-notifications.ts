import type { Order } from '$lib/types/Order';
import { ObjectId, type ChangeStreamDocument, Timestamp, MongoServerError } from 'mongodb';
import { collections, withTransaction } from '../database';
import { Lock } from '../lock';
import { ORIGIN } from '$env/static/private';
import { Kind } from 'nostr-tools';
import { toBitcoins } from '$lib/utils/toBitcoins';
import { getUnixTime, subHours } from 'date-fns';
import { refreshPromise } from '../runtime-config';
import { refreshAvailableStockInDb } from '../product';
import { building } from '$app/environment';

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
										// TODO: check
										input: '$updateDescription.updatedFields',
										field: 'payments.status'
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

if (!building) {
	let changeStream = collections.orders
		.watch(watch, {
			fullDocument: 'updateLookup',
			startAfter:
				(await collections.runtimeConfig
					.findOne({ _id: 'orderNotificationsResumeToken' })
					.then((val) => val?.data)) || undefined
		})
		.on('change', (ev) => handleChanges(ev).catch(console.error))
		.once('error', async (err) => {
			// In case it couldn't resume correctly, start from 1 hour ago
			await changeStream.close().catch(console.error);

			if (err instanceof MongoServerError && err.codeName === 'ChangeStreamHistoryLost') {
				changeStream = collections.orders
					.watch(watch, {
						fullDocument: 'updateLookup',
						startAtOperationTime: Timestamp.fromBits(0, getUnixTime(subHours(new Date(), 1)))
					})
					.on('change', (ev) => handleChanges(ev).catch(console.error))
					.once('error', async (err) => {
						// This time, start from now
						await changeStream.close().catch(console.error);

						if (err instanceof MongoServerError && err.codeName === 'ChangeStreamHistoryLost') {
							changeStream = collections.orders
								.watch(watch, {
									fullDocument: 'updateLookup'
								})
								.on('change', (ev) => handleChanges(ev).catch(console.error));
						} else {
							console.error(err);
							process.exit(1);
						}
					});
			} else {
				console.error(err);
				process.exit(1);
			}
		});
}

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
	await refreshPromise;

	if (processingIds.has(order._id.toString())) {
		return;
	}

	let payments = order.payments.filter((p) => p.status !== p.lastStatusNotified);

	if (payments.length === 0) {
		return;
	}

	try {
		processingIds.add(order._id.toString());

		const updatedOrder = await collections.orders.findOne({
			_id: order._id
		});
		if (!updatedOrder) {
			return;
		}
		order = updatedOrder;

		payments = order.payments.filter((p) => p.status !== p.lastStatusNotified);
		if (payments.length === 0) {
			return;
		}

		const { npub, email } = order.notifications.paymentStatus;

		for (const payment of payments) {
			await withTransaction(async (session) => {
				if (npub) {
					let content = `Order #${order.number} has payment ${payment.status}, see ${ORIGIN}/order/${order._id}`;

					if (payment.status === 'pending') {
						if (payment.method === 'bitcoin') {
							content += `\n\nPlease send ${toBitcoins(
								order.totalPrice.amount,
								order.totalPrice.currency
							).toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC to ${payment.address}`;
						} else if (payment.method === 'lightning') {
							content += `\n\nPlease pay this invoice: ${payment.address}`;
						} else if (payment.method === 'card') {
							content += `\n\nPlease pay using this link: ${payment.address}`;
						}
					}
					if (!(payment.method === 'cash' && payment.status !== 'paid')) {
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
				}

				if (email) {
					let htmlContent = `<p>Order #${order.number}'s payment status changed to ${payment.status}, see <a href="${ORIGIN}/order/${order._id}">${ORIGIN}/order/${order._id}</a></p>`;

					if (payment.status === 'pending') {
						if (payment.method === 'bitcoin') {
							htmlContent += `<p>Please send ${toBitcoins(
								order.totalPrice.amount,
								order.totalPrice.currency
							).toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC to ${
								payment.address
							}</p>`;
						} else if (payment.method === 'lightning') {
							htmlContent += `<p>Please pay this invoice: ${payment.address}</p>`;
						} else if (payment.method === 'card') {
							htmlContent += `<p>Please pay using this link: <a href="${payment.address}">${payment.address}</a></p>`;
						}
					}
					if (!(payment.method === 'cash' && payment.status !== 'paid')) {
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
				}

				await collections.orders.updateOne(
					{
						_id: order._id,
						'payments._id': payment._id
					},
					{
						$set: {
							'payments.$.lastStatusNotified': payment.status
						}
					},
					{
						session
					}
				);
			});
		}

		// Maybe not needed when order.payment.status === "paid"
		await Promise.all(order.items.map((item) => refreshAvailableStockInDb(item.product._id)));
	} finally {
		processingIds.delete(order._id.toString());
	}
}
