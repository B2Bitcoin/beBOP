import { collections } from '$lib/server/database';

export async function load({ url }) {
	const page = url.searchParams.get('page');
	const orders = await collections.orders
		.find()
		.skip(Number(page))
		.limit(50)
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
			currencySnapshot: order.currencySnapshot,
			notes:
				order.notes?.map((note) => ({
					content: note.content,
					createdAt: note.createdAt
				})) || [],
			status: order.status
		}))
	};
}
