import type { Order } from '$lib/types/Order';
import {
	ObjectId,
	type ChangeStreamDocument,
	Timestamp,
	MongoServerError,
	ChangeStream
} from 'mongodb';
import { collections, withTransaction } from '../database';
import { Lock } from '../lock';
import { ORIGIN } from '$env/static/private';
import { Kind } from 'nostr-tools';
import { toBitcoins } from '$lib/utils/toBitcoins';
import { getUnixTime, subHours } from 'date-fns';
import { refreshPromise, runtimeConfig } from '../runtime-config';
import { refreshAvailableStockInDb } from '../product';
import { building } from '$app/environment';
import { rateLimit } from '../rateLimit';
import { isOrderFullyPaid } from '../orders';
import { FRACTION_DIGITS_PER_CURRENCY } from '$lib/types/Currency';

const lock = new Lock('order-notifications');

const processingIds = new Set<string>();

const watchQuery = [
	{
		$match: {
			$or: [
				{
					operationType: 'insert'
				},
				{
					operationType: 'update'
				}
			]
		}
	}
];

let changeStream: ChangeStream<Order>;

async function watch(opts?: { operationTime?: Timestamp }) {
	try {
		rateLimit('0.0.0.0', 'changeStream.order-notifications', 10, { minutes: 5 });
	} catch (err) {
		console.error('Too many changestream restarts, aborting');
		process.exit(1);
	}
	changeStream = collections.orders
		.watch(watchQuery, {
			fullDocument: 'updateLookup',
			...(opts?.operationTime
				? {
						startAtOperationTime: opts.operationTime
				  }
				: {
						startAfter:
							(await collections.runtimeConfig
								.findOne({ _id: 'orderNotificationsResumeToken' })
								.then((val) => val?.data)) || undefined
				  })
		})
		.on('change', (ev) => handleChanges(ev).catch(console.error))
		.once('error', async (err) => {
			console.error('change stream error', err);
			// In case it couldn't resume correctly, start from 1 hour ago
			await changeStream.close().catch(console.error);

			if (err instanceof MongoServerError && err.codeName === 'ChangeStreamHistoryLost') {
				watch({ operationTime: Timestamp.fromBits(0, getUnixTime(subHours(new Date(), 1))) });
			} else {
				watch();
			}
		});

	return changeStream;
}

if (!building) {
	watch();
}

async function handleChanges(change: ChangeStreamDocument<Order>): Promise<void> {
	if (!lock.ownsLock || !('fullDocument' in change) || !change.fullDocument) {
		return;
	}

	if (change.operationType === 'update') {
		const updatedFields = Object.keys(change.updateDescription.updatedFields ?? {});
		if (!updatedFields.some((field) => field === 'payments' || field.startsWith('payments.'))) {
			return;
		}
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
					let content = `Payment for order #${order.number} is ${payment.status}, see ${ORIGIN}/order/${order._id}`;

					if (payment.status === 'pending') {
						if (payment.method === 'bitcoin') {
							content += `\n\nPlease send ${toBitcoins(
								payment.price.amount,
								payment.price.currency
							).toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC to ${payment.address}`;
						} else if (payment.method === 'lightning') {
							content += `\n\nPlease pay this invoice: ${payment.address}`;
						} else if (payment.method === 'card') {
							content += `\n\nPlease pay using this link: ${payment.address}`;
						}
					}
					if (payment.status === 'paid' && !isOrderFullyPaid(order)) {
						content += `Order #${order.number} is not fully paid yet`;
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
					let emailTemplate = { subject: '', html: '' };
					switch (payment.status) {
						case 'canceled':
							emailTemplate = runtimeConfig.emailTemplates['order.payment.canceled'];
							break;
						case 'expired':
							emailTemplate = runtimeConfig.emailTemplates['order.payment.expired'];
							break;
						case 'paid':
							if (isOrderFullyPaid(order)) {
								emailTemplate = runtimeConfig.emailTemplates['order.paid'];
							} else {
								emailTemplate = runtimeConfig.emailTemplates['order.payment.paid'];
							}
							break;
						case 'pending':
							switch (payment.method) {
								case 'bitcoin':
									emailTemplate = runtimeConfig.emailTemplates['order.payment.pending.bitcoin'];
									break;
								case 'lightning':
									emailTemplate = runtimeConfig.emailTemplates['order.payment.pending.lightning'];
									break;
								case 'card':
									emailTemplate = runtimeConfig.emailTemplates['order.payment.pending.card'];
									break;
								case 'bankTransfer':
									emailTemplate =
										runtimeConfig.emailTemplates['order.payment.pending.bankTransfer'];
									break;
							}
					}

					if (emailTemplate.html && emailTemplate.subject) {
						const vars = {
							orderNumber: order.number.toLocaleString(order.locale || 'en'),
							orderLink: `${ORIGIN}/order/${order._id}`,
							paymentLink: `${ORIGIN}/order/${order._id}/payment/${payment._id}`,
							paymentAddress: payment.address,
							amount: payment.price.amount.toLocaleString(order.locale || 'en', {
								maximumFractionDigits: FRACTION_DIGITS_PER_CURRENCY[payment.price.currency],
								minimumFractionDigits: FRACTION_DIGITS_PER_CURRENCY[payment.price.currency]
							}),
							currency: payment.price.currency,
							iban: runtimeConfig.sellerIdentity?.bank?.iban,
							bic: runtimeConfig.sellerIdentity?.bank?.bic
						};

						await collections.emailNotifications.insertOne(
							{
								_id: new ObjectId(),
								createdAt: new Date(),
								updatedAt: new Date(),
								subject: emailTemplate.subject.replace(/{{([^}]+)}}/g, (match, p1) => {
									return p1 in vars ? vars[p1 as keyof typeof vars] || match : match;
								}),
								htmlContent: emailTemplate.html.replace(/{{([^}]+)}}/g, (match, p1) => {
									return p1 in vars ? vars[p1 as keyof typeof vars] || match : match;
								}),
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
