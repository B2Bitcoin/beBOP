import { collections } from '$lib/server/database';
import { ORDER_PAGINATION_LIMIT } from '$lib/types/Order';

export async function load({ url }) {
	const skip = url.searchParams.get('skip');
	const orderNumber = url.searchParams.get('orderNumber');
	const productAlias = url.searchParams.get('productAlias');
	let orders;
	if (orderNumber) {
		orders = await collections.orders.find({ number: Number(orderNumber) }).toArray();
	} else if (productAlias) {
		orders = await collections.orders
			.find({
				'items.product.alias': productAlias
			})
			.toArray();
	} else {
		orders = await collections.orders
			.find()
			.skip(Number(skip))
			.limit(ORDER_PAGINATION_LIMIT)
			.sort({ createdAt: -1 })
			.toArray();
	}

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
