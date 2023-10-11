import { ObjectId } from 'mongodb';
import { collections, withTransaction } from './database';
import { DEFAULT_MAX_QUANTITY_PER_ORDER, type Product } from '$lib/types/Product';
import { error } from '@sveltejs/kit';
import { runtimeConfig } from './runtime-config';
import { refreshAvailableStockInDb } from './product';

/**
 * Be wary if adding Zod: called from NostR as well and need human readable error messages
 */
export async function addToCartInDb(
	product: Product,
	quantity: number,
	params: { sessionId?: string; npub?: string; totalQuantity?: boolean; customAmount?: number }
) {
	if (product.availableDate && !product.preorder && product.availableDate > new Date()) {
		throw error(400, 'Product is not available for preorder');
	}

	if (!params.sessionId && !params.npub) {
		throw new TypeError('No session ID or NPUB provided');
	}

	const query = params.npub ? { npub: params.npub } : { sessionId: params.sessionId };

	let cart = await collections.carts.findOne(query);

	if (!cart) {
		cart = {
			...query,
			_id: new ObjectId(),
			items: [],
			createdAt: new Date(),
			updatedAt: new Date()
		};
	}

	const existingItem = cart.items.find((item) => item.productId === product._id);

	if (existingItem && !product.standalone) {
		existingItem.quantity = params.totalQuantity ? quantity : existingItem.quantity + quantity;

		const max = product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER;
		if (existingItem.quantity > max) {
			existingItem.quantity = max;
		}

		if (product.type === 'subscription') {
			existingItem.quantity = 1;
		}
	} else {
		cart.items.push({
			productId: product._id,
			quantity: product.type === 'subscription' ? 1 : quantity,
			...(params.customAmount &&
				product.type !== 'subscription' && {
					customPrice: { amount: params.customAmount, currency: runtimeConfig.mainCurrency }
				})
		});
	}

	const validCart = cart;
	await withTransaction(async (session) => {
		cart = (
			await collections.carts.findOneAndUpdate(
				{ _id: validCart._id },
				{
					$set: {
						items: validCart.items,
						updatedAt: new Date()
					},
					$setOnInsert: {
						createdAt: new Date(),
						...query
					}
				},
				{ upsert: true, returnDocument: 'after', session }
			)
		).value;

		if (cart) {
			for (const item of cart.items) {
				await refreshAvailableStockInDb(item.productId, session);
			}
		}
	});

	return cart;
}

export async function removeFromCartInDb(
	productId: Product['_id'],
	quantity: number,
	params: { sessionId?: string; npub?: string; totalQuantity?: boolean }
) {
	if (!params.sessionId && !params.npub) {
		throw new TypeError('No session ID or NPUB provided');
	}

	const query = params.npub ? { npub: params.npub } : { sessionId: params.sessionId };

	const cart = await collections.carts.findOne(query);

	if (!cart) {
		throw new TypeError('Cart is empty');
	}

	const item = cart.items.find((i) => i.productId === productId);

	if (!item) {
		return cart;
	}

	const newQty = params.totalQuantity ? quantity : Math.max(item.quantity - quantity, 0);

	item.quantity = newQty;

	if (item.quantity === 0) {
		cart.items = cart.items.filter((it) => it !== item);
	}

	await withTransaction(async (session) => {
		await collections.carts.updateOne(
			{ _id: cart._id },
			{ $set: { items: cart.items, updatedAt: new Date() } },
			{ session }
		);

		await refreshAvailableStockInDb(productId, session);
	});

	return cart;
}
