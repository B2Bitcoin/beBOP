import { getNewAddress } from '$lib/server/bitcoin';
import { collections, withTransaction } from '$lib/server/database';
import { COUNTRY_ALPHA3S } from '$lib/types/Country';
import { error, redirect } from '@sveltejs/kit';
import { addHours } from 'date-fns';
import { Decimal128, ObjectId } from 'mongodb';
import { z } from 'zod';

export const actions = {
	default: async ({ request, locals }) => {
		const cart = await collections.carts.findOne({ sessionId: locals.sessionId });

		if (!cart?.items.length) {
			throw error(400, 'Cart is empty');
		}

		const products = await collections.products
			.find({
				_id: { $in: cart.items.map((item) => item.productId) }
			})
			.toArray();

		const byId = Object.fromEntries(products.map((product) => [product._id, product]));

		cart.items = cart.items.filter((item) => !!byId[item.productId]);

		if (!cart?.items.length) {
			throw error(400, 'Cart is empty');
		}

		if (!products.every((product) => product.price.currency === products[0].price.currency)) {
			throw error(400, 'Cart contains products with different currencies');
		}

		if (
			products.some(
				(product) =>
					product.availableDate && !product.preorder && product.availableDate > new Date()
			)
		) {
			throw error(400, 'Cart contains products that are not yet available');
		}

		const isDigital = products.every((product) => !product.shipping);

		const formData = await request.formData();

		const shipping = isDigital
			? null
			: z
					.object({
						firstName: z.string().min(1),
						lastName: z.string().min(1),
						address: z.string().min(1),
						city: z.string().min(1),
						state: z.string().optional(),
						zip: z.string().min(1),
						country: z.enum(COUNTRY_ALPHA3S)
					})
					.parse(Object.fromEntries(formData));

		// Remove empty string
		if (shipping && !shipping.state) {
			delete shipping.state;
		}

		const paymentMethod = z
			.object({
				paymentMethod: z.enum(['bitcoin', 'lightning'])
			})
			.parse(Object.fromEntries(formData)).paymentMethod;

		if (paymentMethod === 'lightning') {
			throw error(400, 'Lightning payments are not yet supported');
		}

		let total = 0;

		for (const item of cart.items) {
			const product = byId[item.productId];

			const price = parseFloat(product.price.amount.toString());
			const quantity = item.quantity;

			total += price * quantity;
		}

		const orderId = new ObjectId();

		await withTransaction(async (session) => {
			const res = await collections.runtimeConfig.findOneAndUpdate(
				{ _id: 'orderNumber' },
				{ $inc: { data: 1 } as any },
				{ upsert: true, session, returnDocument: 'after' }
			);

			if (!res.value) {
				throw new Error('Failed to increment order number');
			}

			const orderNumber = res.value.data as number;

			await collections.orders.insertOne(
				{
					_id: orderId,
					number: orderNumber,
					sessionId: locals.sessionId,
					createdAt: new Date(),
					updatedAt: new Date(),
					items: cart.items.map((item) => ({
						product: byId[item.productId],
						quantity: item.quantity
					})),
					...(shipping && { shippingAddress: shipping }),
					totalPrice: {
						amount: new Decimal128(String(total)),
						currency: products[0].price.currency
					},
					payment: {
						method: paymentMethod,
						status: 'pending',
						address: await getNewAddress('order:' + orderId.toString()),
						expiresAt: addHours(new Date(), 2)
					}
				},
				{ session }
			);

			await collections.carts.deleteOne({ _id: cart._id }, { session });
		});

		throw redirect(303, `/order/${orderId}`);
	}
};
