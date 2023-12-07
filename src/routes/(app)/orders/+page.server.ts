import { collections } from '$lib/server/database';
import { userIdentifier, userQuery } from '$lib/server/user';

export async function load({ locals }) {
	const orders = await collections.orders
		.find(userQuery(userIdentifier(locals)))
		.limit(100)
		.sort({ createdAt: -1 })
		.toArray();

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
			status: order.status,
			currencySnapshot: order.currencySnapshot
		}))
	};
}
