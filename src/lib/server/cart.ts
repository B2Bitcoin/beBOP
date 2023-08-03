import { ObjectId } from 'mongodb';
import { collections } from './database';
import type { Product } from '$lib/types/Product';
import { MAX_PRODUCT_QUANTITY } from '$lib/types/Cart';
import { error } from '@sveltejs/kit';
import { runtimeConfig } from './runtime-config';

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

	if (existingItem) {
		existingItem.quantity = params.totalQuantity ? quantity : existingItem.quantity + quantity;

		if (existingItem.quantity > MAX_PRODUCT_QUANTITY) {
			existingItem.quantity = MAX_PRODUCT_QUANTITY;
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

	return await collections.carts.findOneAndUpdate(
		{ _id: cart._id },
		{
			$set: {
				items: cart.items,
				updatedAt: new Date()
			},
			$setOnInsert: {
				createdAt: new Date(),
				...query
			}
		},
		{ upsert: true, returnDocument: 'after' }
	);
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

	item.quantity = params.totalQuantity ? quantity : Math.max(item.quantity - quantity, 0);

	if (item.quantity === 0) {
		cart.items = cart.items.filter((it) => it !== item);
	}

	await collections.carts.updateOne(
		{ _id: cart._id },
		{ $set: { items: cart.items, updatedAt: new Date() } }
	);

	return cart;
}
