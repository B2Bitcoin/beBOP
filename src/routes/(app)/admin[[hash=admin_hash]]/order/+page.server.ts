import { collections } from '$lib/server/database';

export async function load() {
	const orders = await collections.orders.find().limit(100).sort({ createdAt: -1 }).toArray();

	return {
		orders: orders.map((order) => ({
			_id: order._id,
			payment: { status: order.payment.status, method: order.payment.method },
			totalPrice: order.totalPrice,
			number: order.number,
			createdAt: order.createdAt,
			totalReceived: order.totalReceived
		}))
	};
}
