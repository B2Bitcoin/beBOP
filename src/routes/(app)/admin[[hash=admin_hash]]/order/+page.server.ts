import { collections } from '$lib/server/database';
import { paymentMethods } from '$lib/server/payment-methods.js';
import { ORDER_PAGINATION_LIMIT } from '$lib/types/Order';
import { z } from 'zod';

export async function load({ url, locals }) {
	const querySchema = z.object({
		skip: z.string().optional(),
		orderNumber: z.string().optional(),
		productAlias: z.string().optional(),
		paymentMethod: z.string().optional()
	});
	const searchParams = Object.fromEntries(url.searchParams.entries());
	const result = querySchema.parse(searchParams);
	const { skip, orderNumber, productAlias, paymentMethod } = result;

	let orders;
	if (orderNumber) {
		orders = await collections.orders.find({ number: Number(orderNumber) }).toArray();
	} else if (productAlias) {
		orders = await collections.orders
			.find({
				'items.product.alias': productAlias
			})
			.sort({ createdAt: -1 })
			.toArray();
	} else if (paymentMethod) {
		orders = await collections.orders
			.find({
				'payments.method': paymentMethod
			})
			.sort({ createdAt: -1 })
			.toArray();
	} else {
		orders = await collections.orders
			.find()
			.skip(Number(skip))
			.limit(ORDER_PAGINATION_LIMIT)
			.sort({ createdAt: -1 })
			.toArray();
	}
	const methods = paymentMethods({ role: locals.user?.roleId });

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
		})),
		paymentMethods: methods
	};
}
