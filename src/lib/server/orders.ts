import type {
	DiscountType,
	Order,
	OrderPayment,
	OrderPaymentStatus,
	Price
} from '$lib/types/Order';
import { ObjectId, type WithId } from 'mongodb';
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
import { sum } from '$lib/utils/sum';
import { computeDeliveryFees, type Cart } from '$lib/types/Cart';
import { MININUM_PER_CURRENCY, type Currency } from '$lib/types/Currency';
import { sumCurrency } from '$lib/utils/sumCurrency';
import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding';
import { refreshAvailableStockInDb } from './product';
import { checkCartItems } from './cart';
import { userQuery } from './user';
import { SMTP_USER } from '$env/static/private';
import { toCurrency } from '$lib/utils/toCurrency';
import { POS_ROLE_ID } from '$lib/types/User';
import type { UserIdentifier } from '$lib/types/UserIdentifier';
import type { PaymentMethod } from './payment-methods';
import { vatRate } from '$lib/types/Country';

async function generateOrderNumber(): Promise<number> {
	const res = await collections.runtimeConfig.findOneAndUpdate(
		{ _id: 'orderNumber' },
		{ $inc: { data: 1 as never } },
		{ upsert: true, returnDocument: 'after' }
	);

	if (!res.value) {
		throw new Error('Failed to increment order number');
	}

	return res.value.data as number;
}

export function isOrderFullyPaid(order: Order, opts?: { includePendingOrders?: boolean }): boolean {
	return (
		sumCurrency(
			order.currencySnapshot.main.totalPrice.currency,
			order.payments
				.filter(
					(payment) =>
						payment.status === 'paid' ||
						(opts?.includePendingOrders && payment.status === 'pending')
				)
				.map((payment) => payment.currencySnapshot.main)
		) >=
		order.currencySnapshot.main.totalPrice.amount -
			MININUM_PER_CURRENCY[order.currencySnapshot.main.totalPrice.currency]
	);
}

export async function onOrderPayment(
	order: Order,
	payment: Order['payments'][0],
	received: { currency: Currency; amount: number }
): Promise<Order> {
	const invoiceNumber = ((await lastInvoiceNumber()) ?? 0) + 1;

	if (!order.payments.includes(payment)) {
		throw new Error('Sync broken between order and payment');
	}

	payment.status = 'paid'; // for isOrderFullyPaid

	return await withTransaction(async (session) => {
		const ret = await collections.orders.findOneAndUpdate(
			{ _id: order._id, 'payments._id': payment._id },
			{
				$set: {
					'payments.$.invoice': {
						number: invoiceNumber,
						createdAt: new Date()
					},
					'payments.$.status': 'paid',
					'payments.$.paidAt': new Date(),
					...(isOrderFullyPaid(order) && {
						status: 'paid'
					}),
					'payments.$.transactions': payment.transactions,
					'currencySnapshot.main.totalReceived': {
						amount:
							toCurrency(
								order.currencySnapshot.main.totalReceived?.currency ?? runtimeConfig.mainCurrency,
								received.amount,
								received.currency
							) + (order.currencySnapshot.main.totalReceived?.amount ?? 0),
						currency:
							order.currencySnapshot.main.totalReceived?.currency ?? runtimeConfig.mainCurrency
					},
					...(runtimeConfig.secondaryCurrency && {
						'currencySnapshot.secondary.totalReceived': {
							amount:
								toCurrency(
									order.currencySnapshot.secondary?.totalReceived?.currency ??
										runtimeConfig.secondaryCurrency,
									received.amount,
									received.currency
								) + (order.currencySnapshot.secondary?.totalReceived?.amount ?? 0),
							currency:
								order.currencySnapshot.secondary?.totalReceived?.currency ??
								runtimeConfig.secondaryCurrency
						}
					}),
					'currencySnapshot.priceReference.totalReceived': {
						amount:
							toCurrency(
								order.currencySnapshot.priceReference.totalReceived?.currency ??
									runtimeConfig.priceReferenceCurrency,
								received.amount,
								received.currency
							) + (order.currencySnapshot.priceReference.totalReceived?.amount ?? 0),
						currency:
							order.currencySnapshot.priceReference.totalReceived?.currency ??
							runtimeConfig.priceReferenceCurrency
					}
				}
			},
			{ session, returnDocument: 'after' }
		);

		if (!ret.value) {
			throw new Error('Failed to update order');
		}

		order = ret.value;

		if (order.status === 'paid') {
			// #region subscriptions
			const subscriptions = await collections.paidSubscriptions
				.find({
					...userQuery(order.user),
					productId: { $in: order.items.map((item) => item.product._id) }
				})
				.toArray();
			for (const subscription of order.items.filter(
				(item) => item.product.type === 'subscription'
			)) {
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

		return ret.value;
	});
}

export async function onOrderPaymentFailed(
	order: Order,
	payment: Order['payments'][0],
	reason: Exclude<OrderPaymentStatus, Exclude<OrderPaymentStatus, 'canceled' | 'expired'>>
): Promise<Order> {
	if (!order.payments.includes(payment)) {
		throw new Error('Sync broken between order and payment');
	}

	payment.status = reason; // for  below

	return await withTransaction(async (session) => {
		const ret = await collections.orders.findOneAndUpdate(
			{
				_id: order._id,
				'payments._id': payment._id,
				...(order.payments.every(
					(payment) => payment.status === 'canceled' || payment.status === 'expired'
				) &&
					order.status === 'pending' && {
						status: 'expired'
					})
			},
			{ $set: { 'payments.$.status': 'expired' } },
			{ returnDocument: 'after', session }
		);
		if (!ret.value) {
			throw new Error('Failed to update order');
		}
		order = ret.value;
		return order;
	});
}

export async function lastInvoiceNumber(): Promise<number | undefined> {
	return (
		await collections.orders
			.aggregate<{ invoiceNumber: number }>([
				{
					$match: {
						'payments.invoice.number': { $exists: true }
					}
				},
				{
					$sort: {
						'payments.invoice.number': -1
					}
				},
				{
					$limit: 1
				},
				{
					$project: {
						'payments.invoice.number': 1
					}
				},
				{
					$unwind: {
						path: '$payments'
					}
				},
				{
					$match: {
						'payments.invoice.number': { $exists: true }
					}
				},
				{
					$sort: {
						'payments.invoice.number': -1
					}
				},
				{
					$limit: 1
				},
				{
					$project: {
						invoiceNumber: '$payments.invoice.number'
					}
				}
			])
			.next()
	)?.invoiceNumber;
}

export async function createOrder(
	items: Array<{
		quantity: number;
		product: Product;
		customPrice?: { amount: number; currency: Currency };
	}>,
	paymentMethod: PaymentMethod,
	params: {
		user: UserIdentifier;
		notifications?: {
			paymentStatus?: {
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
		billingAddress?: Order['billingAddress'] | null;
		reasonFreeVat?: string;
		discount?: {
			amount: number;
			type: DiscountType;
			justification: string;
		};
		clientIp?: string;
		/**
		 * 0-100
		 */
		paymentPercentage?: number;
	}
): Promise<Order['_id']> {
	const npubAddress = params.notifications?.paymentStatus?.npub;
	const email = params.notifications?.paymentStatus?.email;

	const canBeNotified = !!(npubAddress || (emailsEnabled && email));

	if (!canBeNotified && paymentMethod !== 'cash') {
		throw error(400, emailsEnabled ? 'Missing npub address or email' : 'Missing npub address');
	}

	if (
		params.paymentPercentage &&
		(params.paymentPercentage < 10 || params.paymentPercentage > 100)
	) {
		throw error(400, 'Invalid payment percentage');
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
	const shippingPrice = {
		currency: runtimeConfig.mainCurrency,
		amount: 0
	};

	if (!isDigital) {
		if (!params.shippingAddress) {
			throw error(400, 'Shipping address is required');
		} else {
			const { country } = params.shippingAddress;

			shippingPrice.amount = computeDeliveryFees(
				runtimeConfig.mainCurrency,
				country,
				items,
				runtimeConfig.deliveryFees
			);

			if (isNaN(shippingPrice.amount)) {
				throw error(400, 'Some products are not available in your country');
			}
		}
	}

	let totalSatoshis = toSatoshis(shippingPrice.amount, shippingPrice.currency);

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
		!vatCountry || runtimeConfig.vatExempted || params.reasonFreeVat
			? undefined
			: {
					country: vatCountry,
					price: {
						amount: fixCurrencyRounding(totalSatoshis * (vatRate(vatCountry) / 100), 'SAT'),
						currency: 'SAT'
					},
					rate: vatRate(vatCountry)
			  };

	if (vat) {
		totalSatoshis += vat.price.amount;
	}

	const orderNumber = await generateOrderNumber();
	const orderId = crypto.randomUUID();

	let discount: {
		currency: Currency;
		amount: number;
	} | null = null;
	let amount = 0;
	if (params.user.userRoleId === POS_ROLE_ID && params?.discount?.amount) {
		if (params.discount.type === 'fiat') {
			amount = toSatoshis(params.discount.amount, runtimeConfig.mainCurrency);
		} else if (params.discount.type === 'percentage') {
			amount = fixCurrencyRounding(totalSatoshis * (params.discount.amount / 100), 'SAT');
		}

		if (amount > totalSatoshis) {
			amount = totalSatoshis;
		}

		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: 'NEW DISCOUNT',
			htmlContent: `A discount of ${params?.discount?.amount}${
				params.discount.type === 'fiat' ? runtimeConfig.mainCurrency : '%'
			} (${amount} SAT) has been applied to the <a href="${ORIGIN}/order/${orderId}">order ${orderNumber}</a> (${toCurrency(
				runtimeConfig.mainCurrency,
				totalSatoshis,
				'SAT'
			)}${runtimeConfig.mainCurrency}). The discount was applied by ${
				params.user.userLogin
			}. Justification: ${params?.discount?.justification ?? '-'} `,
			dest: runtimeConfig.sellerIdentity?.contact.email || SMTP_USER
		});

		discount = {
			currency: params.discount.type === 'fiat' ? runtimeConfig.mainCurrency : 'SAT',
			amount: params.discount.type === 'fiat' ? params?.discount?.amount : amount
		};
		totalSatoshis -= amount;
	}

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
					...userQuery(params.user),
					'items.product._id': product._id,
					'payment.status': 'pending'
				},
				{ limit: 1 }
			)
		) {
			throw error(400, 'You already have a pending order for this product: ' + product.name);
		}
	}

	if (runtimeConfig.collectIPOnDeliverylessOrders && !params.shippingAddress && !params.clientIp) {
		throw error(400, 'Missing IP address for deliveryless order');
	}
	if (
		isDigital &&
		runtimeConfig.collectBillingAddressOnDeliverylessOrders &&
		!params.billingAddress
	) {
		throw error(400, 'Missing billing address for deliveryless order');
	}
	const satoshisToPay = params.paymentPercentage
		? Math.floor((totalSatoshis * params.paymentPercentage) / 100)
		: totalSatoshis;

	const paymentId = new ObjectId();
	const paymentPrice: Price =
		paymentMethod === 'cash'
			? {
					amount: toCurrency(runtimeConfig.mainCurrency, satoshisToPay, 'SAT'),
					currency: runtimeConfig.mainCurrency
			  }
			: paymentMethod === 'card'
			? {
					amount: toCurrency(runtimeConfig.sumUp.currency, satoshisToPay, 'SAT'),
					currency: runtimeConfig.sumUp.currency
			  }
			: { amount: satoshisToPay, currency: 'SAT' };
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
				status: 'pending',
				sellerIdentity: runtimeConfig.sellerIdentity,
				items: items.map((item) => ({
					quantity: item.quantity,
					product: item.product,
					customPrice: item.customPrice,
					currencySnapshot: {
						main: {
							price: {
								amount: toCurrency(
									runtimeConfig.mainCurrency,
									item.product.price.amount,
									item.product.price.currency
								),
								currency: runtimeConfig.mainCurrency
							},
							...(item.customPrice && {
								customPrice: {
									amount: toCurrency(
										runtimeConfig.mainCurrency,
										item.customPrice.amount,
										item.customPrice.currency
									),
									currency: runtimeConfig.mainCurrency
								}
							})
						},
						...(runtimeConfig.secondaryCurrency && {
							secondary: {
								price: {
									amount: toCurrency(
										runtimeConfig.secondaryCurrency,
										item.product.price.amount,
										item.product.price.currency
									),
									currency: runtimeConfig.secondaryCurrency
								},
								...(item.customPrice && {
									customPrice: {
										amount: toCurrency(
											runtimeConfig.secondaryCurrency,
											item.customPrice.amount,
											item.customPrice.currency
										),
										currency: runtimeConfig.secondaryCurrency
									}
								})
							}
						}),
						priceReference: {
							price: {
								amount: toCurrency(
									runtimeConfig.priceReferenceCurrency,
									item.product.price.amount,
									item.product.price.currency
								),
								currency: runtimeConfig.priceReferenceCurrency
							},
							...(item.customPrice && {
								customPrice: {
									amount: toCurrency(
										runtimeConfig.priceReferenceCurrency,
										item.customPrice.amount,
										item.customPrice.currency
									),
									currency: runtimeConfig.priceReferenceCurrency
								}
							})
						}
					}
				})),
				...(params.shippingAddress && { shippingAddress: params.shippingAddress }),
				...(params.billingAddress && { billingAddress: params.billingAddress }),
				...(vat && { vat }),
				...(shippingPrice
					? {
							shippingPrice
					  }
					: undefined),
				payments: [
					{
						_id: paymentId,
						method: paymentMethod,
						price:
							paymentMethod === 'cash'
								? {
										amount: toCurrency(runtimeConfig.mainCurrency, satoshisToPay, 'SAT'),
										currency: runtimeConfig.mainCurrency
								  }
								: paymentMethod === 'card'
								? {
										amount: toCurrency(runtimeConfig.sumUp.currency, satoshisToPay, 'SAT'),
										currency: runtimeConfig.sumUp.currency
								  }
								: { amount: satoshisToPay, currency: 'SAT' },
						currencySnapshot: {
							main: {
								amount: toCurrency(runtimeConfig.mainCurrency, satoshisToPay, 'SAT'),
								currency: runtimeConfig.mainCurrency
							},
							...(runtimeConfig.secondaryCurrency && {
								secondary: {
									amount: toCurrency(runtimeConfig.secondaryCurrency, satoshisToPay, 'SAT'),
									currency: runtimeConfig.secondaryCurrency
								}
							}),
							priceReference: {
								amount: toCurrency(runtimeConfig.priceReferenceCurrency, satoshisToPay, 'SAT'),
								currency: runtimeConfig.priceReferenceCurrency
							}
						},
						status: 'pending',
						...(await generatePaymentInfo({
							method: paymentMethod,
							orderId,
							orderNumber,
							toPay: paymentPrice,
							paymentId,
							expiresAt
						})),
						expiresAt
					}
				],
				notifications: {
					paymentStatus: {
						...(npubAddress && { npub: npubAddress }),
						...(email && { email })
					}
				},
				user: {
					...params.user,
					// In case the user didn't authenticate with an email/npub but only added them as notification address
					// We still add them add orders for the specified email/npub
					// Mini-downside: if the user put a dummy npub / email, the owner of the npub / email will be able to see the order
					...(!params.user.email && email && { email }),
					...(!params.user.npub && npubAddress && { npub: npubAddress })
				},
				...(params.reasonFreeVat && {
					vatFree: {
						reason: params.reasonFreeVat
					}
				}),
				...(discount &&
					params.discount && {
						discount: {
							price: discount,
							justification: params.discount.justification,
							type: params.discount.type
						}
					}),
				...(params.clientIp && { clientIp: params.clientIp }),
				currencySnapshot: {
					main: {
						totalPrice: {
							amount: toCurrency(runtimeConfig.mainCurrency, totalSatoshis, 'SAT'),
							currency: runtimeConfig.mainCurrency
						},
						...(shippingPrice && {
							shippingPrice: {
								amount: toCurrency(
									runtimeConfig.mainCurrency,
									shippingPrice.amount,
									shippingPrice.currency
								),
								currency: runtimeConfig.mainCurrency
							}
						}),
						...(vat && {
							vat: {
								amount: toCurrency(
									runtimeConfig.mainCurrency,
									vat.price.amount,
									vat.price.currency
								),
								currency: runtimeConfig.mainCurrency
							}
						}),
						...(discount && {
							discount: {
								amount: toCurrency(runtimeConfig.mainCurrency, discount.amount, discount.currency),
								currency: runtimeConfig.mainCurrency
							}
						})
					},
					...(runtimeConfig.secondaryCurrency && {
						secondary: {
							totalPrice: {
								amount: toCurrency(runtimeConfig.secondaryCurrency, totalSatoshis, 'SAT'),
								currency: runtimeConfig.secondaryCurrency
							},
							...(shippingPrice && {
								shippingPrice: {
									amount: toCurrency(
										runtimeConfig.secondaryCurrency,
										shippingPrice.amount,
										shippingPrice.currency
									),
									currency: runtimeConfig.secondaryCurrency
								}
							}),
							...(vat && {
								vat: {
									amount: toCurrency(
										runtimeConfig.secondaryCurrency,
										vat.price.amount,
										vat.price.currency
									),
									currency: runtimeConfig.secondaryCurrency
								}
							}),
							...(discount && {
								discount: {
									amount: toCurrency(
										runtimeConfig.secondaryCurrency,
										discount.amount,
										discount.currency
									),
									currency: runtimeConfig.secondaryCurrency
								}
							})
						}
					}),
					priceReference: {
						totalPrice: {
							amount: toCurrency(runtimeConfig.priceReferenceCurrency, totalSatoshis, 'SAT'),
							currency: runtimeConfig.priceReferenceCurrency
						},
						...(shippingPrice && {
							shippingPrice: {
								amount: toCurrency(
									runtimeConfig.priceReferenceCurrency,
									shippingPrice.amount,
									shippingPrice.currency
								),
								currency: runtimeConfig.priceReferenceCurrency
							}
						}),
						...(vat && {
							vat: {
								amount: toCurrency(
									runtimeConfig.priceReferenceCurrency,
									vat.price.amount,
									vat.price.currency
								),
								currency: runtimeConfig.priceReferenceCurrency
							}
						}),
						...(discount && {
							discount: {
								amount: toCurrency(
									runtimeConfig.priceReferenceCurrency,
									discount.amount,
									discount.currency
								),
								currency: runtimeConfig.priceReferenceCurrency
							}
						})
					}
				}
			},
			{ session }
		);

		if (params.cart) {
			/** Also delete "old" carts with partial user info */
			await collections.carts.deleteMany(userQuery(params.cart.user), { session });
		}

		for (const product of products) {
			if (product.stock) {
				await refreshAvailableStockInDb(product._id, session);
			}
		}
	});

	return orderId;
}

async function generatePaymentInfo(params: {
	method: PaymentMethod;
	orderId: string;
	orderNumber: number;
	toPay: Price;
	paymentId: ObjectId;
	expiresAt?: Date;
}): Promise<{
	address?: string;
	wallet?: string;
	invoiceId?: string;
	checkoutId?: string;
	meta?: unknown;
}> {
	switch (params.method) {
		case 'bitcoin':
			return {
				address: await getNewAddress(orderAddressLabel(params.orderId, params.paymentId)),
				wallet: await currentWallet()
			};
		case 'lightning': {
			const invoice = await lndCreateInvoice(
				toSatoshis(params.toPay.amount, params.toPay.currency),
				{
					...(params.expiresAt && {
						expireAfterSeconds: differenceInSeconds(params.expiresAt, new Date())
					}),
					label: runtimeConfig.includeOrderUrlInQRCode
						? `${ORIGIN}/order/${params.orderId}`
						: undefined
				}
			);

			return {
				address: invoice.payment_request,
				invoiceId: invoice.r_hash
			};
		}
		case 'cash': {
			return {};
		}
		case 'card':
			return await generateCardPaymentInfo(params);
	}
}

async function generateCardPaymentInfo(params: {
	orderId: string;
	orderNumber: number;
	toPay: Price;
	paymentId: ObjectId;
	expiresAt?: Date;
}): Promise<{
	checkoutId: string;
	meta: unknown;
	address: string;
}> {
	{
		const resp = await fetch('https://api.sumup.com/v0.1/checkouts', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${runtimeConfig.sumUp.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				amount: toCurrency(
					runtimeConfig.sumUp.currency,
					params.toPay.amount,
					params.toPay.currency
				),
				currency: runtimeConfig.sumUp.currency,
				checkout_reference: params.orderId,
				merchant_code: runtimeConfig.sumUp.merchantCode,
				redirect_url: `${ORIGIN}/order/${params.orderId}`,
				description: 'Order ' + params.orderNumber,
				...(params.expiresAt && {
					valid_until: params.expiresAt.toISOString()
				})
			})
		});

		if (!resp.ok) {
			console.error(await resp.text());
			throw error(402, 'Sumup checkout creation failed');
		}

		const json = await resp.json();

		const checkoutId = json.id;

		if (!checkoutId || typeof checkoutId !== 'string') {
			console.error('no checkout id', json);
			throw error(402, 'Sumup checkout creation failed');
		}

		return {
			checkoutId,
			meta: json,
			address: `${ORIGIN}/order/${params.orderId}/payment/${params.paymentId}/pay`
		};
	}
}

export async function addOrderPayment(
	order: Order,
	paymentMethod: PaymentMethod,
	params?: { paymentPercentage?: number }
) {
	if (order.status !== 'pending') {
		throw error(400, 'Order is not pending');
	}

	if (
		params?.paymentPercentage &&
		(params.paymentPercentage < 10 || params.paymentPercentage > 100)
	) {
		throw error(400, 'Invalid payment percentage');
	}

	if (isOrderFullyPaid(order, { includePendingOrders: true })) {
		throw error(400, 'Order already fully paid with pending payments');
	}

	// We reuse the same currencies as previous payments
	const mainCurrency = order.currencySnapshot.main.totalPrice.currency;
	const secondaryCurrency = order.currencySnapshot.secondary?.totalPrice.currency;
	const priceReferenceCurrency = order.currencySnapshot.priceReference.totalPrice.currency;

	const alreadyProcessedAmount = sumCurrency(
		mainCurrency,
		order.payments.map((payment) => payment.currencySnapshot.main)
	);

	const maxAmountToPay = params?.paymentPercentage
		? order.currencySnapshot.main.totalPrice.amount * params.paymentPercentage
		: order.currencySnapshot.main.totalPrice.amount;

	const priceToPay = {
		amount: fixCurrencyRounding(
			Math.min(
				maxAmountToPay,
				order.currencySnapshot.main.totalPrice.amount - alreadyProcessedAmount
			),
			mainCurrency
		),
		currency: mainCurrency
	};

	if (priceToPay.amount < MININUM_PER_CURRENCY[priceToPay.currency]) {
		throw error(400, 'Order already fully paid with pending payments');
	}

	const paymentId = new ObjectId();
	const expiresAt =
		paymentMethod === 'cash'
			? undefined
			: addMinutes(new Date(), runtimeConfig.desiredPaymentTimeout);

	const payment: OrderPayment = {
		_id: paymentId,
		status: 'pending',
		method: paymentMethod,
		price:
			paymentMethod === 'cash'
				? {
						amount: toCurrency(runtimeConfig.mainCurrency, priceToPay.amount, priceToPay.currency),
						currency: runtimeConfig.mainCurrency
				  }
				: paymentMethod === 'card'
				? {
						amount: toCurrency(
							runtimeConfig.sumUp.currency,
							priceToPay.amount,
							priceToPay.currency
						),
						currency: runtimeConfig.sumUp.currency
				  }
				: { amount: toCurrency('SAT', priceToPay.amount, priceToPay.currency), currency: 'SAT' },
		currencySnapshot: {
			main: {
				amount: toCurrency(mainCurrency, priceToPay.amount, priceToPay.currency),
				currency: mainCurrency
			},
			...(secondaryCurrency && {
				secondary: {
					amount: toCurrency(secondaryCurrency, priceToPay.amount, priceToPay.currency),
					currency: secondaryCurrency
				}
			}),
			priceReference: {
				amount: toCurrency(priceReferenceCurrency, priceToPay.amount, priceToPay.currency),
				currency: priceReferenceCurrency
			}
		},
		...(expiresAt && { expiresAt }),
		...(await generatePaymentInfo({
			method: paymentMethod,
			orderId: order._id,
			orderNumber: order.number,
			toPay: priceToPay,
			paymentId,
			expiresAt
		}))
	};

	await collections.orders.updateOne(
		{ _id: order._id },
		{
			$push: {
				payments: payment
			}
		}
	);
}
