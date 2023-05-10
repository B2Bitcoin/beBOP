import { collections } from './database';
import { setTimeout } from 'node:timers/promises';
import { processClosed } from './process';
import type { Order } from '$lib/types/Order';
import { listTransactions, orderAddressLabel } from './bitcoin';
import { sum } from '$lib/utils/sum';
import { Lock } from './lock';

const lock = new Lock('orders');

async function maintainOrders() {
	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		try {
			const orders = await collections.orders
				.find({ 'payment.status': 'pending' })
				.project<Pick<Order, 'payment' | 'totalPrice' | '_id'>>({ payment: 1, totalPrice: 1 })
				.toArray();

			for (const order of orders) {
				const transactions = await listTransactions(orderAddressLabel(order._id));

				const received = sum(
					transactions.filter((t) => t.amount > 0 && t.confirmations > 0).map((t) => t.amount)
				);

				if (received >= parseFloat(order.totalPrice.amount.toString())) {
					await collections.orders.updateOne(
						{ _id: order._id },
						{ $set: { 'payment.status': 'paid' } }
					);
				} else if (order.payment.expiresAt < new Date()) {
					await collections.orders.updateOne(
						{ _id: order._id },
						{ $set: { 'payment.status': 'expired' } }
					);
				}
			}
		} catch (err) {
			console.error(err);
		}

		await setTimeout(5_000);
	}
}

maintainOrders();
