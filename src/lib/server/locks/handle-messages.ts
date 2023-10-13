import { ObjectId, type ChangeStreamDocument } from 'mongodb';
import { collections } from '../database';
import { Lock } from '../lock';
import type { NostRReceivedMessage } from '$lib/types/NostRReceivedMessage';
import { Kind } from 'nostr-tools';
import { ORIGIN } from '$env/static/private';
import { refreshPromise, runtimeConfig } from '../runtime-config';
import { toSatoshis } from '$lib/utils/toSatoshis';
import { addSeconds, formatDistance, subMinutes } from 'date-fns';
import { addToCartInDb, removeFromCartInDb } from '../cart';
import type { Product } from '$lib/types/Product';
import { typedInclude } from '$lib/utils/typedIncludes';
import { createOrder } from '../orders';
import { typedEntries } from '$lib/utils/typedEntries';

const lock = new Lock('received-messages');

const processingIds = new Set<string>();

export const NOSTR_PROTOCOL_VERSION = 1;

collections.nostrReceivedMessages
	.watch([{ $match: { operationType: 'insert' } }], {
		fullDocument: 'updateLookup'
	})
	.on('change', (ev) => handleChanges(ev).catch(console.error));

async function handleChanges(change: ChangeStreamDocument<NostRReceivedMessage>): Promise<void> {
	if (!lock.ownsLock || !('fullDocument' in change) || !change.fullDocument) {
		return;
	}

	await handleReceivedMessage(change.fullDocument);
}

lock.onAcquire = async () => {
	const unprocessedMessages = collections.nostrReceivedMessages.find({
		processedAt: { $exists: false }
	});

	for await (const message of unprocessedMessages) {
		await handleReceivedMessage(message).catch(console.error);
	}
};

async function handleReceivedMessage(message: NostRReceivedMessage): Promise<void> {
	if (message.processedAt || processingIds.has(message._id)) {
		return;
	}

	processingIds.add(message._id);

	try {
		const updatedMessage = await collections.nostrReceivedMessages.findOne({ _id: message._id });

		if (!updatedMessage || updatedMessage.processedAt) {
			return;
		}

		await refreshPromise;

		message = updatedMessage;

		const content = message.content;
		const senderNpub = message.source;
		const minCreatedAt = addSeconds(message.createdAt, 1);

		const isCustomer =
			(await collections.nostrNotifications.countDocuments({ dest: senderNpub }, { limit: 1 })) > 0;
		const isPrivateMessage = message.kind === Kind.EncryptedDirectMessage;

		const send = (message: string) => sendMessage(senderNpub, message, minCreatedAt);

		const toMatch = content.trim().replaceAll(/\s+/g, ' ');
		const toMatchLower = toMatch.toLowerCase();

		let matched = false;

		out: for (const [commandName, command] of typedEntries(commands)) {
			if (toMatchLower === commandName || toMatchLower.startsWith(`${commandName} `)) {
				matched = true;

				if (command.maintenanceBlocked && runtimeConfig.isMaintenance) {
					await send(
						`Sorry, ${runtimeConfig.brandName} / ${ORIGIN} is currently under maintenance, try again later.`
					);
					break;
				}

				if (command.args?.length) {
					const rawArgs = toMatchLower
						.slice(commandName.length + 1)
						.split(' ')
						.map((s) => s.trim());

					const minArgs = command.args.filter((arg) => !arg.default).length;
					const maxArgs = command.args.length;

					if (rawArgs.length < minArgs || rawArgs.length > maxArgs) {
						await send(
							`Invalid syntax. Usage: "${usage(
								commandName
							)}". Between ${minArgs} and ${maxArgs} arguments expected.`
						);
						break;
					}

					const args: Record<string, string> = {};

					for (let i = 0; i < command.args.length; i++) {
						const arg = command.args[i];
						const rawArg = rawArgs[i];

						if (!rawArg) {
							if (!arg.default) {
								await send(`Invalid syntax. Usage: "${usage(commandName)}", ${arg.name} expected.`);
								break out;
							}
							args[arg.name] = arg.default;
							continue;
						}

						if (arg.enum && !arg.enum.includes(rawArg)) {
							await send(
								`Invalid syntax. Usage: "${usage(commandName)}", ${
									arg.name
								} must be one of: ${arg.enum.join(', ')}.`
							);
							break out;
						}

						args[arg.name] = rawArgs[i];
					}

					await command.execute(send, { senderNpub, args });
				} else {
					if (toMatchLower !== commandName) {
						await send(`Invalid syntax. Usage: "${commandName}", no arguments expected.`);
						break;
					}
					await command.execute(send, { senderNpub, args: {} });
				}
				break;
			}
		}

		if (!matched && !message.tags?.some(([key]) => key === 'bootikVersion')) {
			await send(
				`Hello ${
					!isPrivateMessage ? 'world' : isCustomer ? 'customer' : 'you'
				}! To get the list of commands, say 'help'.`
			);
		}
		await collections.nostrReceivedMessages.updateOne(
			{ _id: message._id },
			{ $set: { processedAt: new Date(), updatedAt: new Date() } }
		);
	} finally {
		processingIds.delete(message._id);
	}
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

const commands: Record<
	string,
	{
		description: string;
		args?: Array<{
			name: string;
			enum?: Array<string>;
			default?: string;
		}>;
		execute: (
			send: (message: string) => Promise<unknown>,
			params: { senderNpub: string; args: Record<string, string> }
		) => Promise<void>;
		maintenanceBlocked?: boolean;
	}
> = {
	help: {
		description: 'Show the list of commands',
		execute: async (send) => {
			await send(
				`Available commands\n\n` +
					Object.entries(commands)
						.map(([name, { description }]) => `- ${usage(name)}: ${description}`)
						.join('\n')
			);
		}
	},
	catalog: {
		description: 'Show the list of products',
		execute: async (send) => {
			if (!runtimeConfig.discovery) {
				await send('Discovery is not enabled for this bootik. You cannot access the catalog.');
			} else {
				const products = await collections.products.find({}).toArray();

				if (!products.length) {
					await send('Catalog is empty');
				} else {
					// todo: proper price depending on currency
					await send(
						products
							.map(
								(product) =>
									`- ${product.name} [ref: "${product._id}"] / ${toSatoshis(
										product.price.amount,
										product.price.currency
									).toLocaleString('en-US')} SAT / ${ORIGIN}/product/${product._id}`
							)
							.join('\n')
					);
				}
			}
		}
	},
	'detailed catalog': {
		description: 'Show the list of products, with product descriptions',
		execute: async (send) => {
			if (!runtimeConfig.discovery) {
				await send('Discovery is not enabled for this bootik. You cannot access the catalog.');
			} else {
				const products = await collections.products.find({}).toArray();

				if (!products.length) {
					await send('Catalog is empty');
				} else {
					// todo: proper price depending on currency
					await send(
						products
							.map(
								(product) =>
									`- ${product.name} [ref: "${product._id}"] / ${toSatoshis(
										product.price.amount,
										product.price.currency
									).toLocaleString('en-US')} SAT / ${ORIGIN}/product/${
										product._id
									} / ${product.shortDescription.replaceAll(/\s+/g, ' ')}`
							)
							.join('\n')
					);
				}
			}
		}
	},
	cart: {
		description: 'Show the contents of your cart',
		maintenanceBlocked: true,
		execute: async (send, { senderNpub }) => {
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
						const price = toSatoshis(product.price.amount * item.quantity, product.price.currency);
						totalPrice += price;
						return `- ref: "${product._id}" / ${price.toLocaleString('en-US')} SAT / Quantity: ${
							item.quantity
						}`;
					});
				await send(
					items.join('\n') +
						`\n\nTotal: ${totalPrice.toLocaleString('en-US')} SAT. Type "checkout" to pay.`
				);
			}
		}
	},
	add: {
		description: 'Add a product to your cart',
		maintenanceBlocked: true,
		args: [{ name: 'ref' }, { name: 'quantity', default: '1' }],
		execute: async (send, { senderNpub, args }) => {
			const ref = args.ref;
			const quantity = parseInt(args.quantity);

			if (isNaN(quantity) || quantity <= 0) {
				await send('Invalid quantity: ' + args.quantity);
			}

			const product = await collections.products.findOne({ _id: ref });

			if (!product) {
				const products = await collections.products
					.find({})
					.project<Pick<Product, '_id'>>({ _id: 1 })
					.toArray();
				await send(
					`No product found with ref "${ref}". Use "catalog" to get the list of products. Available refs: ${products
						.map((p) => p._id)
						.join(', ')}`
				);
				return;
			}

			const cart = await addToCartInDb(product, quantity, { npub: senderNpub }).catch(async (e) => {
				console.error(e);
				await send(e.message);
				return null;
			});

			if (!cart) {
				return;
			}

			const item = cart.items.find((item) => item.productId === product._id);

			if (!item) {
				return;
			}

			await send(
				`"${product.name}" added to cart for a total quantity of ${
					item.quantity
				} and price of ${toSatoshis(
					product.price.amount * item.quantity,
					product.price.currency
				).toLocaleString('en-US')} SAT`
			);
		}
	},
	remove: {
		description: 'Remove a product from your cart',
		maintenanceBlocked: true,
		args: [{ name: 'ref' }, { name: 'quantity', default: 'all' }],
		execute: async (send, { senderNpub, args }) => {
			const ref = args.ref;
			const quantity = args.quantity === 'all' ? Infinity : parseInt(args.quantity);

			if (isNaN(quantity) || quantity < 0) {
				await send('Invalid quantity: ' + args.quantity);
				return;
			}

			const product = await collections.products.findOne({ _id: ref });

			if (!product) {
				await send(
					'No product found with ref: ' + ref + '. Use "catalog" to get the list of products'
				);
				return;
			}

			const cart = await removeFromCartInDb(product, quantity, {
				npub: senderNpub
			}).catch(async (e) => {
				console.error(e);
				await send(e.message);
				return null;
			});

			if (!cart) {
				return;
			}

			const item = cart.items.find((item) => item.productId === product._id);

			if (!item) {
				await send(`"${product.name}" removed from cart`);
				return;
			}

			await send(
				`"${product.name}" remaining in your cart for a total quantity of ${
					item.quantity
				} and price of ${toSatoshis(
					item.quantity * product.price.amount,
					product.price.currency
				).toLocaleString('en-US')} SAT`
			);
		}
	},
	checkout: {
		description: 'Checkout your cart',
		maintenanceBlocked: true,
		args: [{ name: 'paymentMethod', enum: ['bitcoin', 'lightning'] }],
		execute: async (send, { senderNpub, args }) => {
			const paymentMethod = args.paymentMethod;

			const cart = await collections.carts.findOne({ npub: senderNpub });

			if (!cart) {
				await send("Your cart is empty, you can't checkout an empty cart");
				return;
			}

			const products = await collections.products
				.find({ _id: { $in: cart.items.map((i) => i.productId) } })
				.toArray();

			if (products.some((product) => product.shipping)) {
				await send(
					'Some products in your cart require shipping, this is not yet supported by the bot. Please remove them from your cart or use the website to checkout'
				);
				return;
			}

			const productById = Object.fromEntries(products.map((p) => [p._id, p]));

			const items = cart.items
				.filter((i) => productById[i.productId])
				.map((i) => ({
					quantity: i.quantity,
					product: productById[i.productId]
				}));

			// Should not happen
			if (!typedInclude(['bitcoin', 'lightning'], paymentMethod)) {
				await send(
					'Invalid payment method: ' +
						paymentMethod +
						'. Available payment methods: bitcoin, lightning'
				);
				return;
			}

			await createOrder(items, paymentMethod, {
				notifications: {
					paymentStatus: {
						npub: senderNpub
					}
				},
				vatCountry: '',
				shippingAddress: null,
				cart
			}).catch(async (e) => {
				console.error(e);
				await send(e.message);
			});
		}
	},
	orders: {
		description: 'Show your orders',
		execute: async (send, { senderNpub }) => {
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
		}
	},
	subscribe: {
		description: 'Subscribe to catalog updates',
		execute: async (send, { senderNpub }) => {
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
		}
	},
	unsubscribe: {
		description: 'Unsubscribe from catalog updates',
		execute: async (send, { senderNpub }) => {
			const result = await collections.bootikSubscriptions.deleteOne({ npub: senderNpub });

			if (result.deletedCount) {
				await send('You are unsubscribed from the catalog');
			} else {
				await send('You were already unsubscribed from the catalog');
			}
		}
	},
	subscriptions: {
		description: 'Show your paid subscriptions',
		execute: async (send, { senderNpub }) => {
			{
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
									}, end: ${formatDistance(subscription.paidUntil, new Date(), {
										addSuffix: true
									})}${subscription.cancelledAt ? ' [cancelled]' : ''}`
							)
							.join('\n')
					);
				}
			}
		}
	},
	cancel: {
		description: 'Cancel a paid subscription',
		args: [{ name: 'subscriptionNumber' }],
		execute: async (send, { senderNpub, args }) => {
			const number = parseInt(args.subscriptionNumber, 10);

			if (isNaN(number)) {
				await send('Invalid subscription number: ' + args.subscriptionNumber);
				return;
			}

			const subscription = await collections.paidSubscriptions.findOne({
				npub: senderNpub,
				number
			});

			if (!subscription) {
				await send('No subscription found with number ' + number + ' for your npub');
				return;
			}

			if (subscription.cancelledAt) {
				await send('Subscription #' + number + ' was already cancelled');
				return;
			}

			await collections.paidSubscriptions.updateOne(
				{ _id: subscription._id },
				{ $set: { cancelledAt: new Date() } }
			);

			await send('Subscription #' + number + ' was cancelled, you will not be reminded anymore');
		}
	}
};

function usage(commandName: string) {
	const command = commands[commandName];

	return `${commandName} ${(command.args || [])
		.map(
			(arg) =>
				` [${arg.enum ? arg.enum.join('|') : arg.name}${arg.default ? `=${arg.default}` : ''}]`
		)
		.join('')}`.trim();
}
