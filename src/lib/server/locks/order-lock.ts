import { collections, withTransaction } from '../database';
import { setTimeout } from 'node:timers/promises';
import { processClosed } from '../process';
import type { Order } from '$lib/types/Order';
import { listTransactions, orderAddressLabel } from '../bitcoin';
import { sum } from '$lib/utils/sum';
import { Lock } from '../lock';
import { inspect } from 'node:util';
import { lndLookupInvoice } from '../lightning';
import { toSatoshis } from '$lib/utils/toSatoshis';
import { onOrderPaid } from '../orders';
import { refreshPromise, runtimeConfig } from '../runtime-config';
import { getConfirmationBlocks } from '$lib/utils/getConfirmationBlocks';
import type { StrictUpdateFilter } from 'mongodb';
import { toCurrency } from '$lib/utils/toCurrency';
import { SUMUP_API_KEY } from '$env/static/private';
import { addMinutes } from 'date-fns';

const lock = new Lock('orders');

async function maintainOrders() {
	await refreshPromise;

	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		const bitcoinOrders = await collections.orders
			.find({ 'payment.status': 'pending', 'payment.method': 'bitcoin' })
			.toArray()
			.catch((err) => {
				console.error(inspect(err, { depth: 10 }));
				return [];
			});

		for (const order of bitcoinOrders) {
			try {
				const transactions = await listTransactions(orderAddressLabel(order._id));

				const confirmationBlocks = getConfirmationBlocks(order.totalPrice.amount);

				const received = sum(
					transactions
						.filter((t) => t.amount > 0 && t.confirmations >= confirmationBlocks)
						.map((t) => t.amount)
				);

				const satReceived = toSatoshis(received, 'BTC');

				if (satReceived >= toSatoshis(order.totalPrice.amount, order.totalPrice.currency)) {
					await withTransaction(async (session) => {
						await collections.orders.updateOne(
							{ _id: order._id },
							{
								$set: {
									'payment.status': 'paid',
									'payment.paidAt': new Date(),
									'payment.transactions': transactions.map((transaction) => ({
										id: transaction.txid,
										amount: transaction.amount,
										currency: 'BTC' as const
									})),
									totalReceived: {
										amount: satReceived,
										currency: 'SAT' as const
									},
									'amountsInOtherCurrencies.main.totalReceived': {
										amount: toCurrency(runtimeConfig.mainCurrency, satReceived, 'SAT'),
										currency: runtimeConfig.mainCurrency
									},
									...(runtimeConfig.secondaryCurrency && {
										'amountsInOtherCurrencies.secondary.totalReceived': {
											amount: toCurrency(runtimeConfig.secondaryCurrency, satReceived, 'SAT'),
											currency: runtimeConfig.secondaryCurrency
										}
									}),
									'amountsInOtherCurrencies.priceReference.totalReceived': {
										amount: toCurrency(runtimeConfig.priceReferenceCurrency, satReceived, 'SAT'),
										currency: runtimeConfig.priceReferenceCurrency
									}
								} satisfies StrictUpdateFilter<Order>
							},
							{ session }
						);

						await onOrderPaid(order, session);
					});
				} else if (order.payment.expiresAt < new Date()) {
					await collections.orders.updateOne(
						{ _id: order._id },
						{ $set: { 'payment.status': 'expired' } }
					);
				}
			} catch (err) {
				console.error(inspect(err, { depth: 10 }));
			}
		}

		const lightningOrders = await collections.orders
			.find({ 'payment.status': 'pending', 'payment.method': 'lightning' })
			.project<Pick<Order, 'payment' | 'totalPrice' | '_id'>>({ payment: 1, totalPrice: 1 })
			.toArray()
			.catch((err) => {
				console.error(inspect(err, { depth: 10 }));
				return [];
			});

		for (const order of lightningOrders) {
			try {
				if (!order.payment.invoiceId) {
					throw new Error('Missing invoice ID on lightning order');
				}
				const invoice = await lndLookupInvoice(order.payment.invoiceId);

				if (invoice.state === 'SETTLED') {
					await withTransaction(async (session) => {
						const result = await collections.orders.findOneAndUpdate(
							{ _id: order._id },
							{
								$set: {
									'payment.status': 'paid',
									'payment.paidAt': invoice.settled_at,
									totalReceived: {
										amount: invoice.amt_paid_sat,
										currency: 'SAT' as const
									},
									'amountsInOtherCurrencies.main.totalReceived': {
										amount: toCurrency(runtimeConfig.mainCurrency, invoice.amt_paid_sat, 'SAT'),
										currency: runtimeConfig.mainCurrency
									},
									...(runtimeConfig.secondaryCurrency && {
										'amountsInOtherCurrencies.secondary.totalReceived': {
											amount: toCurrency(
												runtimeConfig.secondaryCurrency,
												invoice.amt_paid_sat,
												'SAT'
											),
											currency: runtimeConfig.secondaryCurrency
										}
									}),
									'amountsInOtherCurrencies.priceReference.totalReceived': {
										amount: toCurrency(
											runtimeConfig.priceReferenceCurrency,
											invoice.amt_paid_sat,
											'SAT'
										),
										currency: runtimeConfig.priceReferenceCurrency
									}
								} satisfies StrictUpdateFilter<Order>
							},
							{ returnDocument: 'after' }
						);
						if (!result.value) {
							throw new Error('Failed to update order');
						}
						await onOrderPaid(result.value, session);
					});
				} else if (invoice.state === 'CANCELED') {
					await collections.orders.updateOne(
						{ _id: order._id },
						{ $set: { 'payment.status': 'expired' } }
					);
				}
			} catch (err) {
				console.error(inspect(err, { depth: 10 }));
			}
		}

		if (SUMUP_API_KEY) {
			const cardOrders = await collections.orders
				.find({ 'payment.status': 'pending', 'payment.method': 'card' })
				.project<Pick<Order, 'payment' | 'totalPrice' | '_id'>>({ payment: 1, totalPrice: 1 })
				.toArray()
				.catch((err) => {
					console.error(inspect(err, { depth: 10 }));
					return [];
				});

			for (const order of cardOrders) {
				try {
					const checkoutId = order.payment.checkoutId;

					if (!checkoutId) {
						throw new Error('Missing checkout ID on card order');
					}

					const response = await fetch('https://api.sumup.com/v0.1/checkouts/' + checkoutId, {
						headers: {
							Authorization: 'Bearer ' + SUMUP_API_KEY
						}
					});

					if (!response.ok) {
						throw new Error('Failed to fetch checkout status');
					}

					const checkout = await response.json();

					if (checkout.status === 'PAID') {
						await withTransaction(async (session) => {
							const result = await collections.orders.findOneAndUpdate(
								{ _id: order._id },
								{
									$set: {
										'payment.status': 'paid',
										'payment.paidAt': new Date(),
										'payment.transactions': checkout.transactions,
										totalReceived: {
											amount: checkout.amount,
											currency: checkout.currency
										},
										'amountsInOtherCurrencies.main.totalReceived': {
											amount: toCurrency(
												runtimeConfig.mainCurrency,
												checkout.amount,
												checkout.currency
											),
											currency: runtimeConfig.mainCurrency
										},
										...(runtimeConfig.secondaryCurrency && {
											'amountsInOtherCurrencies.secondary.totalReceived': {
												amount: toCurrency(
													runtimeConfig.secondaryCurrency,
													checkout.amount,
													checkout.currency
												),
												currency: runtimeConfig.secondaryCurrency
											}
										}),
										'amountsInOtherCurrencies.priceReference.totalReceived': {
											amount: toCurrency(
												runtimeConfig.priceReferenceCurrency,
												checkout.amount,
												checkout.currency
											),
											currency: runtimeConfig.priceReferenceCurrency
										}
									} satisfies StrictUpdateFilter<Order>
								},
								{ returnDocument: 'after' }
							);
							if (!result.value) {
								throw new Error('Failed to update order');
							}
							await onOrderPaid(result.value, session);
						});
					} else if (checkout.status === 'FAILED') {
						await collections.orders.updateOne(
							{ _id: order._id },
							{ $set: { 'payment.status': 'expired' } }
						);
					}
				} catch (err) {
					console.error(inspect(err, { depth: 10 }));
					if (addMinutes(order.payment.expiresAt, 10) < new Date()) {
						await collections.orders.updateOne(
							{ _id: order._id },
							{ $set: { 'payment.status': 'expired' } }
						);
					}
				}
			}
		}

		await setTimeout(2_000);
	}
}

maintainOrders();
