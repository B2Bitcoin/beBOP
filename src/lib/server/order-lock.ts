import { collections } from './database';
import { setTimeout } from 'node:timers/promises';
import { processClosed } from './process';
import type { Order } from '$lib/types/Order';
import { listTransactions, orderAddressLabel } from './bitcoin';
import { sum } from '$lib/utils/sum';
import { Lock } from './lock';
import { inspect } from 'node:util';
import { lndLookupInvoice } from './lightning';
import { SATOSHIS_PER_BTC } from '$lib/types/Currency';

const lock = new Lock('orders');

async function maintainOrders() {
	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		const bitcoinOrders = await collections.orders
			.find({ 'payment.status': 'pending', 'payment.method': 'bitcoin' })
			.project<Pick<Order, 'payment' | 'totalPrice' | '_id'>>({ payment: 1, totalPrice: 1 })
			.toArray()
			.catch((err) => {
				console.error(inspect(err, { depth: 10 }));
				return [];
			});

		for (const order of bitcoinOrders) {
			try {
				const transactions = await listTransactions(orderAddressLabel(order._id));

				const received = sum(
					transactions.filter((t) => t.amount > 0 && t.confirmations > 0).map((t) => t.amount)
				);

				if (received >= parseFloat(order.totalPrice.amount.toString())) {
					await collections.orders.updateOne(
						{ _id: order._id },
						{
							$set: {
								'payment.status': 'paid',
								'payment.paidAt': new Date(),
								'payment.transactions': transactions.map((transaction) => ({
									txid: transaction.txid,
									amount: transaction.amount
								})),
								'payment.totalReceived': received
							}
						}
					);
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
				const invoice = await lndLookupInvoice(order.payment.invoiceId!);

				if (invoice.state === 'SETTLED') {
					await collections.orders.updateOne(
						{ _id: order._id },
						{
							$set: {
								'payment.status': 'paid',
								'payment.paidAt': invoice.settled_at,
								'payment.totalReceived': invoice.amt_paid_sat / SATOSHIS_PER_BTC
							}
						}
					);
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

		await setTimeout(5_000);
	}
}

maintainOrders();
