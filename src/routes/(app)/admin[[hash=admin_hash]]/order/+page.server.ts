import { collections } from '$lib/server/database';
import { paymentMethods } from '$lib/server/payment-methods';
import { COUNTRY_ALPHA2S } from '$lib/types/Country.js';
import { type Order, ORDER_PAGINATION_LIMIT } from '$lib/types/Order';

import type { Filter } from 'mongodb';
import { z } from 'zod';

export async function load({ url, locals }) {
	const methods = paymentMethods({ role: locals.user?.roleId });

	const querySchema = z.object({
		skip: z.number({ coerce: true }).int().min(0).optional().default(0),
		orderNumber: z.number({ coerce: true }).int().min(0).optional(),
		productAlias: z.string().optional(),
		paymentMethod: z.enum(['' as const, ...methods]).optional(),
		country: z.enum(['' as const, ...COUNTRY_ALPHA2S]).optional(),
		email: z.string().optional(),
		label: z.string().optional(),
		npub: z.string().optional()
	});

	const searchParams = Object.fromEntries(url.searchParams.entries());
	const result = querySchema.parse(searchParams);
	const { skip, orderNumber, productAlias, paymentMethod, country, email, npub, label } = result;

	const query: Filter<Order> = {};

	if (orderNumber) {
		query.number = orderNumber;
	} else if (productAlias) {
		query['items.product.alias'] = productAlias;
	} else if (paymentMethod) {
		query['payments.method'] = paymentMethod;
	} else if (country) {
		query['shippingAddress.country'] = country;
	} else if (email) {
		query['user.email'] = email;
	} else if (npub) {
		query['user.npub'] = npub;
	} else if (label) {
		query['orderLabelIds'] = label;
	}

	const orders = await collections.orders
		.find(query)
		.skip(skip)
		.limit(ORDER_PAGINATION_LIMIT)
		.sort({ createdAt: -1 })
		.toArray();
	const labels = await collections.labels.find({}).toArray();
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
			status: order.status,
			orderLabelIds: order.orderLabelIds
		})),
		paymentMethods: methods,
		labels
	};
}
