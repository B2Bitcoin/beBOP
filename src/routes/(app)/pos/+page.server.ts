import { collections } from '$lib/server/database.js';
import { userIdentifier, userQuery } from '$lib/server/user.js';

export const load = async (event) => {
	const lastOrders = await collections.orders
		.find({
			...userQuery(userIdentifier(event.locals))
		})
		.sort({ createdAt: -1 })
		.limit(50)
		.toArray();

	return {
		orders: lastOrders.map((order) => ({
			_id: order._id,
			payment: { status: order.payment.status, method: order.payment.method },
			totalReceived: order.totalReceived,
			amountsInOtherCurrencies: order.amountsInOtherCurrencies,
			totalPrice: order.totalPrice,
			number: order.number,
			createdAt: order.createdAt
		}))
	};
};
