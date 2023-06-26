import { ObjectId, type ChangeStreamDocument } from 'mongodb';
import { collections } from '../database';
import { Lock } from '../lock';
import type { NostRReceivedMessage } from '$lib/types/NostRReceivedMessage';
import { Kind } from 'nostr-tools';
import { ORIGIN } from '$env/static/private';
import { runtimeConfig } from '../runtime-config';
import { toSatoshis } from '$lib/utils/toSatoshis';
import { addSeconds, formatDistance, subMinutes } from 'date-fns';
import { addToCartInDb, removeFromCartInDb } from '../cart';

const lock = new Lock('received-messages');

// todo: resume changestream on restart if possible
collections.nostrReceivedMessages
	.watch([{ $match: { operationType: 'insert' } }], {
		fullDocument: 'updateLookup'
	})
	.on('change', (ev) => handleChanges(ev).catch(console.error));

async function handleChanges(change: ChangeStreamDocument<NostRReceivedMessage>): Promise<void> {
	if (!lock.ownsLock || !('fullDocument' in change) || !change.fullDocument) {
		return;
	}

	if (change.fullDocument.processedAt) {
		return;
	}

	const content = change.fullDocument.content;
	const senderNpub = change.fullDocument.source;
	const minCreatedAt = addSeconds(change.fullDocument.createdAt, 1);

	const isCustomer =
		(await collections.nostrNotifications.countDocuments({ dest: senderNpub }, { limit: 1 })) > 0;
	const isPrivateMessage = change.fullDocument.kind === Kind.EncryptedDirectMessage;

	const send = (message: string) => sendMessage(senderNpub, message, minCreatedAt);

	const toMatch = content.trim().replaceAll(/\s+/g, ' ');
	const toMatchLower = toMatch.toLowerCase();

	switch (toMatchLower) {
		case 'help':
			await send(
				`Commands:

- cart: Show the content of your cart
- add [product ref] [quantity]: Add a product to your cart. Quantity defaults to 1. Type "catalog" to see the list of products.
- remove [product ref] [quantity]: Remove a product from your cart. Quantity defaults to all. Type "cart" to see your cart.
- checkout [bitcoin|lightning]: Checkout your cart, and pay with bitcoin or lightning
- orders: Show the list of orders associated to your npub
- catalog: Show the catalog
- detailed catalog: Show the catalog, with product descriptions
- subscribe: Subscribe to catalog updates
- unsubscribe: Unsubscribe from catalog updates
- subscriptions: Show the list of paid subscriptions associated to your npub
- cancel [subscription number]: Cancel a paid subscription to not be reminded anymore`
			);
			break;
		case 'orders': {
			const orders = await collections.orders
				.find({ 'notifications.paymentStatus.npub': senderNpub })
				.sort({ createdAt: -1 })
				.limit(100)
				.toArray();

			if (orders.length) {
				await send(
					orders.map((order) => `- #${order.number}: ${ORIGIN}/order/${order._id}`).join('\n')
				);
			} else {
				await send('No orders found for your npub');
			}

			break;
		}
		case 'cart': {
			const cart = await collections.carts.findOne({ npub: senderNpub });

			if (!cart || !cart.items.length) {
				await send('Your cart is empty');
			} else {
				const products = await collections.products
					.find({ _id: { $in: cart.items.map((item) => item.productId) } })
					.toArray();
				const productById = Object.fromEntries(products.map((product) => [product._id, product]));

				let totalPrice = 0;
				const items = cart.items
					.filter((item) => productById[item.productId])
					.map((item) => {
						const product = productById[item.productId];
						const price = toSatoshis(
							product.price.amount * item.quantity,
							product.price.currency,
							runtimeConfig.BTC_EUR
						);
						totalPrice += price;
						return `- ref: ${product._id}] / ${price} SAT / Quantity: ${item.quantity}`;
					});
				await send(items.join('\n') + `\n\nTotal: ${totalPrice.toLocaleString('en-US')} SAT`);
			}

			break;
		}
		case 'detailed catalog':
		case 'catalog': {
			if (!runtimeConfig.discovery) {
				await send('Discovery is not enabled for this bootik. You cannot access the catalog.');
			} else {
				const products = await collections.products.find({}).toArray();

				if (!products.length) {
					await sendMessage(senderNpub, 'Catalog is empty', minCreatedAt);
				} else {
					// todo: proper price dependinc on currency
					await send(
						products
							.map(
								(product) =>
									`- ${product.name} [ref: ${product._id}] / ${toSatoshis(
										product.price.amount,
										product.price.currency,
										runtimeConfig.BTC_EUR
									)} SAT / ${ORIGIN}/product/${product._id}${
										content === 'detailed catalog'
											? ` / ${product.shortDescription.replaceAll(/\s+/g, ' ')}`
											: ''
									}`
							)
							.join('\n')
					);
				}
			}
			break;
		}
		case 'subscribe':
			if (!runtimeConfig.discovery) {
				await send('Discovery is not enabled for the bootik, you cannot subscribe');
			} else {
				await collections.bootikSubscriptions.updateOne(
					{ npub: senderNpub },
					{
						$set: {
							updatedAt: new Date()
						},
						$setOnInsert: {
							createdAt: new Date()
						}
					},
					{ upsert: true }
				);
				await send(
					'You are subscribed to the catalog, you will receive messages when new products are added'
				);
			}
			break;
		case 'unsubscribe': {
			const result = await collections.bootikSubscriptions.deleteOne({ npub: senderNpub });

			if (result.deletedCount) {
				await send('You were unsubscribed from the catalog');
			} else {
				await send('You were already unsubscribed from the catalog');
			}
			break;
		}
		case 'subscriptions': {
			const subscriptions = await collections.paidSubscriptions
				.find({ npub: senderNpub, paidUntil: { $gt: new Date() } })
				.sort({ number: 1 })
				.toArray();

			if (!subscriptions.length) {
				await send('No active subscriptions found for your npub');
			} else {
				await send(
					subscriptions
						.map(
							(subscription) =>
								`- #${subscription.number}: ${ORIGIN}/subscription/${
									subscription._id
								}, end: ${formatDistance(subscription.paidUntil, new Date(), { addSuffix: true })}${
									subscription.cancelledAt ? ' [cancelled]' : ''
								}`
						)
						.join('\n')
				);
			}

			break;
		}
		default:
			if (toMatchLower.startsWith('cancel ')) {
				const number = parseInt(toMatch.slice('cancel '.length), 10);

				if (isNaN(number)) {
					await send('Invalid subscription number: ' + toMatch.slice('cancel '.length));
					break;
				}

				const subscription = await collections.paidSubscriptions.findOne({
					npub: senderNpub,
					number
				});

				if (!subscription) {
					await send('No subscription found with number ' + number + ' for your npub');
					break;
				}

				if (subscription.cancelledAt) {
					await send('Subscription #' + number + ' was already cancelled');
					break;
				}

				await collections.paidSubscriptions.updateOne(
					{ _id: subscription._id },
					{ $set: { cancelledAt: new Date() } }
				);

				await send('Subscription #' + number + ' was cancelled, you will not be reminded anymore');
				break;
			} else if (toMatchLower.startsWith('add ')) {
				const data = toMatch.slice('order '.length).split(' ');

				const ref = data[0];
				const quantity = parseInt(data[1] || '1');

				if (isNaN(quantity) || quantity <= 0) {
					await send('Invalid quantity: ' + data[1]);
					break;
				}

				const product = await collections.products.findOne({ _id: ref });

				if (!product) {
					await send(
						'No product found with ref: ' + ref + '. Use "catalog" to get the list of products'
					);
					break;
				}

				const cart = await addToCartInDb(product, quantity, { npub: senderNpub }).catch((e) =>
					send(e.message).then(() => null)
				);

				if (!cart) {
					break;
				}

				const item = cart.value?.items.find((item) => item.productId === product._id);

				if (!item) {
					break;
				}

				await send(
					`"${product.name}" x${item.quantity} added to cart for ${(
						product.price.amount * item.quantity
					).toLocaleString('en-US')} ${product.price.currency}`
				);
				break;
			} else if (toMatch.startsWith('remove ')) {
				const data = toMatch.slice('remove '.length).trim().split(' ');

				const ref = data[0];
				const quantity = data[1] ? parseInt(data[1]) : 0;
				const totalQuantity = data[1] ? false : true;

				if (isNaN(quantity) || quantity < 0) {
					await send('Invalid quantity: ' + data[1]);
					break;
				}

				const product = await collections.products.findOne({ _id: ref });

				if (!product) {
					await send(
						'No product found with ref: ' + ref + '. Use "catalog" to get the list of products'
					);
					break;
				}

				const cart = await removeFromCartInDb(product._id, quantity, {
					npub: senderNpub,
					totalQuantity
				}).catch((e) => send(e.message).then(() => null));

				if (!cart) {
					break;
				}

				const item = cart.items.find((item) => item.productId === product._id);

				if (!item) {
					await send(`"${product.name}" removed from cart`);
					break;
				}

				await send(
					`"${product.name}" x${item.quantity} remaining in your cart for ${(
						product.price.amount * item.quantity
					).toLocaleString('en-US')} ${product.price.currency}`
				);
				break;
			}
			await send(
				`Hello ${
					!isPrivateMessage ? 'world' : isCustomer ? 'customer' : 'you'
				}! To get the list of commands, say 'help'.`
			);
	}
	await collections.nostrReceivedMessages.updateOne(
		{ _id: change.fullDocument._id },
		{ $set: { processedAt: new Date(), updatedAt: new Date() } }
	);
}

async function sendMessage(dest: string, content: string, minCreatedAt: Date) {
	const lastMessage = await collections.nostrNotifications.countDocuments({
		dest,
		content,
		createdAt: { $gt: subMinutes(new Date(), 1) }
	});

	// Do not send the same message twice in a minute, avoid larsen effect
	if (lastMessage) {
		return;
	}

	return collections.nostrNotifications.insertOne({
		dest,
		_id: new ObjectId(),
		createdAt: new Date(),
		updatedAt: new Date(),
		minCreatedAt,
		kind: Kind.EncryptedDirectMessage,
		content
	});
}
