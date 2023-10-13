import { addToCartInDb, removeFromCartInDb } from '$lib/server/cart';
import { collections, withTransaction } from '$lib/server/database';
import { refreshAvailableStockInDb } from '$lib/server/product.js';
import { DEFAULT_MAX_QUANTITY_PER_ORDER } from '$lib/types/Product.js';
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

		await withTransaction(async (session) => {
			await collections.carts.updateOne(
				{ _id: cart._id },
				{ $set: { items: cart.items, updatedAt: new Date() } },
				{ session }
			);

			await refreshAvailableStockInDb(params.id, session);
		});

		throw redirect(303, request.headers.get('referer') || '/cart');
	},
	increase: async ({ locals, params, request }) => {
		const product = await collections.products.findOne({ _id: params.id });

		if (!product) {
			await collections.carts.updateOne(
				{ sessionId: locals.sessionId },
				{ $pull: { items: { productId: params.id } }, $set: { updatedAt: new Date() } }
			);
			throw error(404, 'This product does not exist');
		}

		const formData = await request.formData();

		const max = product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER;

		const { quantity } = z
			.object({
				quantity: z
					.number({ coerce: true })
					.int()
					.min(1)
					.max(max - 1)
			})
			.parse({
				quantity: formData.get('quantity')
			});

		await addToCartInDb(product, quantity + 1, {
			sessionId: locals.sessionId,
			totalQuantity: true
		});

		throw redirect(303, request.headers.get('referer') || '/cart');
	},
	decrease: async ({ request, locals, params }) => {
		const product = await collections.products.findOne({ _id: params.id });

		if (!product) {
			await collections.carts.updateOne(
				{ sessionId: locals.sessionId },
				{ $pull: { items: { productId: params.id } }, $set: { updatedAt: new Date() } }
			);
			throw error(404, 'This product does not exist');
		}
		const formData = await request.formData();

		const max = product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER;
		const { quantity } = z
			.object({
				quantity: z.number({ coerce: true }).int().min(1).max(max)
			})
			.parse({
				quantity: formData.get('quantity')
			});

		await removeFromCartInDb(product, quantity - 1, {
			sessionId: locals.sessionId,
			totalQuantity: true
		});

		throw redirect(303, request.headers.get('referer') || '/cart');
	}
};
