import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { userQuery } from '$lib/server/user.js';

export const load = async (event) => {
	const lastOrders = await collections.orders
		.find({
			...userQuery(event.locals)
		})
		.sort({ createdAt: -1 })
		.limit(50)
		.toArray();

	return {
		orders: lastOrders.map((order) => ({
			_id: order._id,
			payment: order.payment,
			totalPrice: order.totalPrice,
			number: order.number,
			createdAt: order.createdAt
		})),
		priceReferenceCurrency: runtimeConfig.priceReferenceCurrency
	};
};
