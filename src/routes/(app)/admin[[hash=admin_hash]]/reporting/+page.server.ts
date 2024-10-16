import { collections } from '$lib/server/database';
import { countryFromIp } from '$lib/server/geoip';
import { sum } from '$lib/utils/sum';
import { pojo } from '$lib/server/pojo.js';
import { endOfMonth, startOfMonth } from 'date-fns';

export async function load({ url }) {
	const month = Number(url.searchParams.get('month'));
	const year = Number(url.searchParams.get('year'));
	let date = new Date();
	if (year && month) {
		date = new Date(year, month - 1);
	}
	const orders = await collections.orders
		.find({
			createdAt: {
				$gte: startOfMonth(date),
				$lt: endOfMonth(date)
			}
		})
		.sort({ createdAt: -1 })
		.toArray();

	return {
		orders: orders.map((order) => ({
			_id: order._id,
			payments: order.payments.map((payment) => ({
				...pojo(payment),
				id: payment._id.toString()
			})),
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
