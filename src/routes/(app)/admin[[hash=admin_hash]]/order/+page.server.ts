import { collections } from '$lib/server/database';
import { PaymentMethod, paymentMethods } from '$lib/server/payment-methods.js';
import { COUNTRY_ALPHA2S, CountryAlpha2 } from '$lib/types/Country.js';
import { ORDER_PAGINATION_LIMIT } from '$lib/types/Order';
import { z } from 'zod';

export async function load({ url, locals }) {
	const methods = paymentMethods({ role: locals.user?.roleId });

	const querySchema = z.object({
		skip: z.preprocess(
			(val) => (val !== undefined ? Number(val) : undefined),
			z.number().int().min(0).optional().default(0)
		),
		orderNumber: z.preprocess(
			(val) => (val !== undefined ? Number(val) : undefined),
			z.number().int().min(0).optional()
		),
		productAlias: z.string().optional(),
		paymentMethod: z.enum(methods as [PaymentMethod, ...PaymentMethod[]]).optional(),
		country: z.enum([...COUNTRY_ALPHA2S] as [CountryAlpha2, ...CountryAlpha2[]]).optional(),
		email: z.string().optional(),
		npub: z.string().optional()
	});

	const searchParams = Object.fromEntries(url.searchParams.entries());
	const result = querySchema.parse(searchParams);
	const { skip, orderNumber, productAlias, paymentMethod, country, email, npub } = result;

	const query: Record<string, unknown> = {};

	if (orderNumber) {
		query.number = orderNumber;
	} else if (productAlias) {
		query['items.product.alias'] = productAlias;
	} else if (paymentMethod && country) {
		query['payments.method'] = paymentMethod;
		query['shippingAddress.country'] = country;
	} else if (email) {
		query['user.email'] = email;
	} else if (npub) {
		query['user.npub'] = npub;
	}

	const orders = await collections.orders
		.find(query)
		.skip(skip)
		.limit(ORDER_PAGINATION_LIMIT)
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
		})),
		paymentMethods: methods
	};
}
