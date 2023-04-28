import { collections } from '$lib/server/database.js';
import { MAX_PRODUCT_QUANTITY } from '$lib/types/Cart.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const actions = {
	remove: async ({ locals, params, request }) => {
		const cart = await collections.carts.findOne({ sessionId: locals.sessionId });

		if (!cart) {
			throw error(404, 'This product is not in the cart');
		}

		const item = cart.items.find((i) => i.productId === params.id);

		if (!item) {
			throw error(404, 'This product is not in the cart');
		}

		cart.items = cart.items.filter((it) => it !== item);

		await collections.carts.updateOne(
			{ _id: cart._id },
			{ $set: { items: cart.items, updatedAt: new Date() } }
		);

		throw redirect(303, request.headers.get('referer') || '/cart');
	},
	increase: async ({ locals, params, request }) => {
		const cart = await collections.carts.findOne({ sessionId: locals.sessionId });

		if (!cart) {
			throw error(404, 'This product is not in the cart');
		}

		const item = cart.items.find((i) => i.productId === params.id);

		if (!item) {
			throw error(404, 'This product is not in the cart');
		}

		const formData = await request.formData();

		const { quantity } = z
			.object({
				quantity: z
					.number({ coerce: true })
					.int()
					.min(1)
					.max(MAX_PRODUCT_QUANTITY - 1)
			})
			.parse({
				quantity: formData.get('quantity')
			});

		item.quantity = quantity + 1;

		await collections.carts.updateOne(
			{ _id: cart._id },
			{ $set: { items: cart.items, updatedAt: new Date() } }
		);

		throw redirect(303, request.headers.get('referer') || '/cart');
	},
	decrease: async ({ request, locals, params }) => {
		const cart = await collections.carts.findOne({ sessionId: locals.sessionId });

		if (!cart) {
			throw error(404, 'This product is not in the cart');
		}

		const item = cart.items.find((i) => i.productId === params.id);

		if (!item) {
			throw error(404, 'This product is not in the cart');
		}

		const formData = await request.formData();
		const { quantity } = z
			.object({
				quantity: z.number({ coerce: true }).int().min(1).max(MAX_PRODUCT_QUANTITY)
			})
			.parse({
				quantity: formData.get('quantity')
			});

		item.quantity = quantity - 1;

		if (item.quantity === 0) {
			cart.items = cart.items.filter((it) => it !== item);
		}

		await collections.carts.updateOne(
			{ _id: cart._id },
			{ $set: { items: cart.items, updatedAt: new Date() } }
		);

		throw redirect(303, request.headers.get('referer') || '/cart');
	}
};
