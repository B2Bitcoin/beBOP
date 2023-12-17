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
import { runtimeConfig, refreshPromise } from '../runtime-config';
import { refreshAvailableStockInDb } from '../product';
import { building } from '$app/environment';
import { rateLimit } from '../rateLimit';
import { isOrderFullyPaid } from '../orders';

const lock = new Lock('order-notifications');

const processingIds = new Set<string>();

const watchQuery = [
	{
		$match: {
			$or: [
				// Not practical when there can be an arbitrary number of payments
				// {
				// 	$expr: {
				// 		$not: {
				// 			$not: [
				// 				{
				// 					$getField: {
				// 						// TODO: check
				// 						input: '$updateDescription.updatedFields',
				// 						field: 'payments.0.status'
				// 					}
				// 				}
				// 			]
				// 		}
				// 	}
				// },
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
		if (!updatedFields.some((field) => /^payments\.\d+\.status$/.test(field))) {
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
						content += `\n\nOrder #${order.number} is not fully paid yet`;
					}
					if (!(payment.method === 'point-of-sale' && payment.status !== 'paid')) {
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
					let htmlContentEn = `<p>Dear customer,<br>I hope you're doing well!</p>`;
					let htmlContentFR = `<p>Chère cliente, cher client,<br>Nous espérons que vous allez bien !</p>`;
					let htmlContent = ``;

					htmlContentEn += `<p>We're contacting you about your order #${order.number}, which current payment status being ${payment.status}.</p><p>You can retrieve your order informations <a href="${ORIGIN}/order/${order._id}">by following this link</a>.</p>`;
					htmlContentFR += `<p>Nous vous contactons à propos de votre commande #${order.number}, actuellement au statut "${payment.status}".</p><p>Vous pouvez retrouver les informations à propos de votre commande <a href="${ORIGIN}/order/${order._id}">en suivant ce lien</a>.</p>`;
					if (payment.status === 'pending') {
						htmlContentEn += `<p>We have to thank you for your order, and we inform you that it was succesfully saved on our system.</p><p>We're now expecting your payment to finalise your purchase.</p><p>Once we'll receive your payment, we'll contact you back to give you details your products delivery.</p>`;
						htmlContentFR += `<p>Nous vous remercions de votre commande, et vous informons qu'elle a bien été enregistrée dans notre système.</p><p>Nous attendons maintenant le règlement de votre paiement pour finaliser la transaction.</p><p>Dès réception de votre paiement, nous vous recontacterons pour vous informer des details pour la livraison de votre achat.</p>`;
						if (payment.method === 'bitcoin') {
							htmlContentEn += `<p>Please send ${toBitcoins(
								payment.price.amount,
								payment.price.currency
							).toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC to ${
								payment.address
							}</p>`;
							htmlContentFR += `<p>Veuillez envoyer ${toBitcoins(
								payment.price.amount,
								payment.price.currency
							).toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC à l'adresse ${
								payment.address
							}</p>`;
						} else if (payment.method === 'lightning') {
							htmlContentEn += `<p>Please pay this invoice: ${payment.address}</p>`;
							htmlContentFR += `<p>Merci de régler cette facture : ${payment.address}</p>`;
						} else if (payment.method === 'card') {
							htmlContentEn += `<p>Please pay using this link: <a href="${payment.address}">${payment.address}</a></p>`;
							htmlContentFR += `<p>Merci de régler via ce lien : <a href="${payment.address}">${payment.address}</a></p>`;
						}
					}
					if (payment.status === 'paid' && !isOrderFullyPaid(order)) {
						htmlContentEn += `<p>Great news ! We received and validated your partial payment. Thanks for your trust in ${runtimeConfig.brandName}.</p><p>Your order will be process once fully paid. We will contact your to provide details regarding the future payment (means & schedule).</p>`;
						htmlContentEn += `<p>Order <a href="${ORIGIN}/order/${order._id}">#${order.number}</a> (partially paid)</p>`;
						htmlContentFR += `<p>Bonne nouvelle ! Nous avons bien reçu votre paiement partiel. Un grand merci pour votre confiance en ${runtimeConfig.brandName}.</p><p>Votre commande sera finalisée dès qu'entièrement payée. Nous vous contacterons pour vous fournir les détails à propos du reste du paiement (méthode de paiement et plannification).</p>`;
						htmlContentFR += `<p>Commande <a href="${ORIGIN}/order/${order._id}">#${order.number}</a> (paiement partiel)</p>`;
					}
					if (payment.status === 'paid' && isOrderFullyPaid(order)) {
						htmlContentEn += `<p>Great news ! We received and validated your payment. Thanks for your trust in ${runtimeConfig.brandName}.</p><p>We will contact you very soon to provide details regarding the delivery of your purchase.</p><p>Your satisfaction is our greatest priority. Feel free to contact us about anything, for any specific request or any question.</p>`;
						htmlContentFR += `<p>Bonne nouvelle ! Nous avons bien reçu votre paiement. Un grand merci pour votre confiance en ${runtimeConfig.brandName}.</p><p>Nous vous contacterons prochainement pour vous informer de l'expédition de votre commande.</p><p>Votre satisfaction est notre priorité absolue. N'hésitez pas à nous contacter si vous avez des demandes spécifiques ou des questions.</p>`;
					}
					htmlContentEn += `<p>Best regards,<br>${runtimeConfig.brandName} team</p>`;
					htmlContentFR += `<p>Best regards,<br>${runtimeConfig.brandName} team</p>`;
					htmlContent += htmlContentEn;
					htmlContent += `<p></p><p>-----</p><p></p>`;
					htmlContent += htmlContentFR;
					if (!(payment.method === 'point-of-sale' && payment.status !== 'paid')) {
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
