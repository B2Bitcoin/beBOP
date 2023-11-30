import { adminPrefix } from '$lib/server/admin';
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
			payment: order.payment,
			totalPrice: order.totalPrice,
			number: order.number,
			createdAt: order.createdAt,
			totalReceived: order.totalReceived,
			amountsInOtherCurrencies: order.amountsInOtherCurrencies
		})),
		adminPrefix: adminPrefix()
	};
}
