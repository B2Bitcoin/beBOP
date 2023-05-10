import { collections } from './database';
import { setTimeout } from 'node:timers/promises';
import { processClosed, processId } from './process';
import type { Order } from '$lib/types/Order';
import { listTransactions } from './bitcoin';
import { sum } from '$lib/utils/sum';

let ownsLock = false;

async function maintainLock(): Promise<void> {
	while (!processClosed) {
		try {
			let lock = await collections.locks.findOne({
				_id: 'orders'
			});

			if (!lock) {
				lock = {
					_id: 'orders',
					createdAt: new Date(),
					updatedAt: new Date(),
					ownerId: processId
				};

				await collections.locks.insertOne(lock);
				ownsLock = true;
			} else {
				const res = await collections.locks.updateOne(
					{
						_id: 'orders',
						ownerId: processId
					},
					{
						$set: {
							updatedAt: new Date()
						}
					}
				);
				ownsLock = res.matchedCount > 0;
			}
		} catch {
			ownsLock = false;
		}

		await setTimeout(5_000);
	}
}

async function maintainOrders() {
	while (!closed) {
		if (!ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		try {
			const orders = await collections.orders
				.find({ status: 'pending' })
				.project<Pick<Order, 'payment' | 'totalPrice' | '_id'>>({ payment: 1 })
				.toArray();

			for (const order of orders) {
				const transactions = await listTransactions('order:' + order._id.toHexString());

				const received = sum(
					transactions.filter((t) => t.amount > 0 && t.confirmations > 0).map((t) => t.amount)
				);

				if (received >= parseFloat(order.totalPrice.amount.toString())) {
					await collections.orders.updateOne(
						{ _id: order._id },
						{ $set: { 'payment.status': 'paid' } }
					);
				}
			}
		} catch (err) {
			console.error(err);
		}

		await setTimeout(5_000);
	}
}

maintainLock();
maintainOrders();
