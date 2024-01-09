import { collections } from '$lib/server/database';

export async function load() {
	const orders = await collections.orders.find().limit(100).sort({ createdAt: -1 }).toArray();

	return {
		orders: orders.map((order) => ({
			_id: order._id,
			payments: order.payments.map((payment) => ({
				id: payment._id.toString(),
				status: payment.status,
				method: payment.method
			})),
			number: order.number,
			createdAt: order.createdAt,
			currencySnapshot: order.currencySnapshot,
			notes: order.notes,
			status: order.status
		}))
	};
}
