import { collections } from '$lib/server/database';
import { countryFromIp } from '$lib/server/geoip';
import { pojo } from '$lib/server/pojo';
import { sum } from '$lib/utils/sum';

export async function load() {
	const orders = await collections.orders.find().sort({ createdAt: -1 }).toArray();

	return {
		orders: orders.map((order) => ({
			_id: order._id,
			payments: order.payments.map(pojo),
			number: order.number,
			createdAt: order.createdAt,
			currencySnapshot: order.currencySnapshot,
			status: order.status,
			items: order.items.map((item) => ({
				...item,
				product: {
					...item.product,
					vatProfileId: item.product.vatProfileId?.toString()
				}
			})),
			quantityOrder: sum(order.items.map((items) => items.quantity)),
			billingAddress: order.billingAddress,
			shippingAddress: order.shippingAddress,
			ipCountry: countryFromIp(order.clientIp ?? '')
		}))
	};
}
