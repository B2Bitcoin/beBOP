import type { Order } from '$lib/types/Order';
import type { ClientSession, WithId } from 'mongodb';
import { collections, withTransaction } from './database';
import { add, addMinutes, addMonths, differenceInSeconds, max, subSeconds } from 'date-fns';
import { runtimeConfig } from './runtime-config';
import { generateSubscriptionNumber } from './subscriptions';
import type { Product } from '$lib/types/Product';
import { error } from '@sveltejs/kit';
import { toSatoshis } from '$lib/utils/toSatoshis';
import { currentWallet, getNewAddress, orderAddressLabel } from './bitcoin';
import { lndCreateInvoice } from './lightning';
import { ORIGIN } from '$env/static/private';
import { emailsEnabled } from './email';
import { filterUndef } from '$lib/utils/filterUndef';
import { sum } from '$lib/utils/sum';
import { computeDeliveryFees, type Cart } from '$lib/types/Cart';
import { vatRates } from './vat-rates';
import type { Currency } from '$lib/types/Currency';
import { sumCurrency } from '$lib/utils/sumCurrency';
import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding';
import { refreshAvailableStockInDb } from './product';
import { checkCartItems } from './cart';
import type { UserIdentifier } from '$lib/types/UserIdentifier';
import { userQuery } from './user';

async function generateOrderNumber(): Promise<number> {
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
	// #region subscriptions
	const orConditions = filterUndef([
		order.notifications.paymentStatus.npub
			? { 'notifications.paymentStatus.npub': order.notifications.paymentStatus.npub }
			: undefined,
		order.notifications.paymentStatus.email
			? { 'notifications.paymentStatus.email': order.notifications.paymentStatus.email }
			: undefined
	]);
	const subscriptions = orConditions.length
		? await collections.paidSubscriptions
				.find({
					$or: orConditions,
					productId: { $in: order.items.map((item) => item.product._id) }
				})
				.toArray()
		: [];
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
							[`${runtimeConfig.subscriptionDuration}s`]: 1
						}),
						updatedAt: new Date(),
						notifications: []
					},
					$unset: { cancelledAt: 1 }
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
					user: order.user,
					productId: subscription.product._id,
					paidUntil: add(new Date(), { [`${runtimeConfig.subscriptionDuration}s`]: 1 }),
					createdAt: new Date(),
					updatedAt: new Date(),
					notifications: []
				},
				{ session }
			);
		}
	}
	//#endregion

	//#region challenges
	const challenges = await collections.challenges
		.find({
			beginsAt: { $lt: new Date() },
			endsAt: { $gt: new Date() }
		})
		.toArray();
	for (const challenge of challenges) {
		const productIds = new Set(challenge.productIds);
		const items = productIds.size
			? order.items.filter((item) => productIds.has(item.product._id))
			: order.items;
		const increase = sum(
			items.map((item) =>
				challenge.mode === 'moneyAmount'
					? toSatoshis(item.product.price.amount * item.quantity, item.product.price.currency)
					: item.quantity
			)
		);

		await collections.challenges.updateOne(
			{ _id: challenge._id },
			{
				$inc: { progress: increase }
			},
			{ session }
		);
	}
	//#endregion

	// Update product stock in DB
	for (const item of order.items.filter((item) => item.product.stock)) {
		await collections.products.updateOne(
			{
				_id: item.product._id
			},
			{
				$inc: { 'stock.total': -item.quantity, 'stock.available': -item.quantity },
				$set: { updatedAt: new Date() }
			},
			{ session }
		);
	}
}

export async function createOrder(
	items: Array<{
		quantity: number;
		product: Product;
		customPrice?: { amount: number; currency: Currency };
	}>,
	paymentMethod: Order['payment']['method'],
	params: {
		user: UserIdentifier;
		notifications: {
			paymentStatus: {
				npub?: string;
				email?: string;
			};
		};
		/**
		 * Will automatically delete the cart after the order is created
		 *
		 * Also, allows using the stock reserved by the cart
		 */
		cart?: WithId<Cart>;
		vatCountry: string;
		shippingAddress: Order['shippingAddress'] | null;
	}
): Promise<Order['_id']> {
	const { notifications: { paymentStatus: { npub: npubAddress, email } = {} } = {} } = params;

	const canBeNotified = !!(npubAddress || (emailsEnabled && email));

	if (!canBeNotified && paymentMethod !== 'cash') {
		throw error(400, emailsEnabled ? 'Missing npub address or email' : 'Missing npub address');
	}

	const products = items.map((item) => item.product);
	if (
		products.some(
			(product) => product.availableDate && !product.preorder && product.availableDate > new Date()
		)
	) {
		throw error(
			400,
			'Cart contains products that are not yet available: ' +
				products
					.filter(
						(product) =>
							product.availableDate && !product.preorder && product.availableDate > new Date()
					)
					.map((product) => product.name)
					.join(', ')
		);
	}

	await checkCartItems(items, params.cart);

	const isDigital = products.every((product) => !product.shipping);
	let deliveryFees = 0;

	if (!isDigital) {
		if (!params.shippingAddress) {
			throw error(400, 'Shipping address is required');
		} else {
			const { country } = params.shippingAddress;

			deliveryFees = computeDeliveryFees(
				runtimeConfig.mainCurrency,
				country,
				items,
				runtimeConfig.deliveryFees
			);

			if (isNaN(deliveryFees)) {
				throw error(400, 'Some products are not available in your country');
			}
		}
	}

	let totalSatoshis = toSatoshis(deliveryFees, runtimeConfig.mainCurrency);

	const itemPrices = items.map((item) => {
		const price = parseFloat(item.product.price.amount.toString());

		const quantity = item.quantity;
		if (item.product.type !== 'subscription' && item.customPrice) {
			const customPrice = parseFloat(item.customPrice.amount.toString());
			return { amount: customPrice * quantity, currency: item.customPrice.currency };
		} else {
			return { amount: price * quantity, currency: item.product.price.currency };
		}
	});

	totalSatoshis += sumCurrency('SAT', itemPrices);

	const vatCountry = runtimeConfig.vatSingleCountry ? runtimeConfig.vatCountry : params.vatCountry;
	const vat: Order['vat'] =
		!vatCountry || runtimeConfig.vatExempted
			? undefined
			: {
					country: vatCountry,
					price: {
						amount: fixCurrencyRounding(
							totalSatoshis * ((vatRates[vatCountry as keyof typeof vatRates] || 0) / 100),
							'SAT'
						),
						currency: 'SAT'
					},
					rate: vatRates[vatCountry as keyof typeof vatRates] || 0
			  };

	if (vat) {
		totalSatoshis += vat.price.amount;
	}

	const orderId = crypto.randomUUID();

	const subscriptions = items.filter((item) => item.product.type === 'subscription');

	if (subscriptions.length && !canBeNotified) {
		throw error(400, 'Missing npub address or email for subscription');
	}

	for (const subscription of subscriptions) {
		const product = subscription.product;

		if (subscription.quantity > 1) {
			throw error(
				400,
				'Cannot order more than one of a subscription at a time for product: ' + product.name
			);
		}

		const existingSubscription = await collections.paidSubscriptions.findOne({
			...userQuery(params.user),
			productId: product._id
		});

		if (existingSubscription) {
			if (
				subSeconds(existingSubscription.paidUntil, runtimeConfig.subscriptionReminderSeconds) >
				new Date()
			) {
				throw error(
					400,
					'You already have an active subscription for this product: ' +
						product.name +
						', which is not due for renewal yet.'
				);
			}
		}

		if (
			await collections.orders.countDocuments(
				{
					$or: filterUndef([
						npubAddress ? { 'notifications.paymentStatus.npub': npubAddress } : undefined,
						email ? { 'notifications.paymentStatus.email': email } : undefined
					]),
					'items.product._id': product._id,
					'payment.status': 'pending'
				},
				{ limit: 1 }
			)
		) {
			throw error(400, 'You already have a pending order for this product: ' + product.name);
		}
	}

	const orderNumber = await generateOrderNumber();

	await withTransaction(async (session) => {
		const expiresAt =
			paymentMethod === 'cash'
				? addMonths(new Date(), 1)
				: addMinutes(new Date(), runtimeConfig.desiredPaymentTimeout);

		await collections.orders.insertOne(
			{
				_id: orderId,
				number: orderNumber,
				createdAt: new Date(),
				updatedAt: new Date(),
				items,
				...(params.shippingAddress && { shippingAddress: params.shippingAddress }),
				...(vat && { vat }),
				totalPrice: {
					amount: totalSatoshis,
					currency: 'SAT'
				},
				...(deliveryFees
					? {
							shippingPrice: {
								amount: deliveryFees,
								currency: runtimeConfig.mainCurrency
							}
					  }
					: undefined),
				payment: {
					method: paymentMethod,
					status: 'pending',
					...(await (async () => {
						switch (paymentMethod) {
							case 'bitcoin':
								return {
									address: await getNewAddress(orderAddressLabel(orderId)),
									wallet: await currentWallet()
								};
							case 'lightning': {
								const invoice = await lndCreateInvoice(totalSatoshis, {
									expireAfterSeconds: differenceInSeconds(expiresAt, new Date()),
									label: runtimeConfig.includeOrderUrlInQRCode
										? `${ORIGIN}/order/${orderId}`
										: undefined
								});

								return {
									address: invoice.payment_request,
									invoiceId: invoice.r_hash
								};
							}
							case 'cash': {
								return {};
							}
							default:
								throw error(400, 'Invalid payment method: ' + paymentMethod);
						}
					})()),
					expiresAt
				},
				notifications: {
					paymentStatus: {
						...(npubAddress && { npub: npubAddress }),
						...(email && { email })
					}
				},
				user: {
					...params.user,
					// In case the user didn't authenticate with an email but still wants to be notified,
					// we also associate the email to the order
					...(email && { email })
				}
			},
			{ session }
		);

		if (params.cart) {
			await collections.carts.deleteOne({ _id: params.cart._id }, { session });
		}

		for (const product of products) {
			if (product.stock) {
				await refreshAvailableStockInDb(product._id, session);
			}
		}
	});

	return orderId;
}
