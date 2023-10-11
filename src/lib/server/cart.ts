import { ObjectId } from 'mongodb';
import { collections, withTransaction } from './database';
import { DEFAULT_MAX_QUANTITY_PER_ORDER, type Product } from '$lib/types/Product';
import { error } from '@sveltejs/kit';
import { runtimeConfig } from './runtime-config';
import { amountOfProductReserved, refreshAvailableStockInDb } from './product';
import { sum } from '$lib/utils/sum';
import type { Cart } from '$lib/types/Cart';

/**
 * Be wary if adding Zod: called from NostR as well and need human readable error messages
 */
export async function addToCartInDb(
	product: Product,
	quantity: number,
	params: { sessionId?: string; npub?: string; totalQuantity?: boolean; customAmount?: number }
) {
	if (quantity < 0) {
		throw new TypeError('Quantity cannot be negative');
	}

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

	const availableAmount = await computeAvailableAmount(product, cart);

	if (availableAmount < 0) {
		throw error(400, 'Product is out of stock');
	}

	if (product.standalone) {
		if (quantity !== 1) {
			throw error(400, 'You can only order one of this product');
		}
		cart.items.push({
			productId: product._id,
			quantity: 1,
			...(params.customAmount &&
				product.type !== 'subscription' && {
					customPrice: { amount: params.customAmount, currency: runtimeConfig.mainCurrency }
				})
		});
	} else if (existingItem) {
		existingItem.quantity = params.totalQuantity ? quantity : existingItem.quantity + quantity;

		const max = Math.min(
			product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER,
			availableAmount
		);

		if (existingItem.quantity > max) {
			throw error(400, `You can only order ${max} of this product`);
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
	product: Product,
	quantity: number,
	params: { sessionId?: string; npub?: string; totalQuantity?: boolean }
) {
	if (quantity < 0) {
		throw new TypeError('Quantity cannot be negative');
	}

	if (!params.sessionId && !params.npub) {
		throw new TypeError('No session ID or NPUB provided');
	}

	const query = params.npub ? { npub: params.npub } : { sessionId: params.sessionId };

	const cart = await collections.carts.findOne(query);

	if (!cart) {
		throw new TypeError('Cart is empty');
	}

	const item = cart.items.find((i) => i.productId === product._id);

	if (!item) {
		return cart;
	}

	const newQty = params.totalQuantity ? quantity : Math.max(item.quantity - quantity, 0);

	const availableAmount = await computeAvailableAmount(product, cart);

	item.quantity = Math.min(
		availableAmount,
		newQty,
		product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER
	);

	if (item.quantity <= 0) {
		cart.items = cart.items.filter((it) => it !== item);
	}

	await withTransaction(async (session) => {
		await collections.carts.updateOne(
			{ _id: cart._id },
			{ $set: { items: cart.items, updatedAt: new Date() } },
			{ session }
		);

		await refreshAvailableStockInDb(product._id, session);
	});

	return cart;
}

async function computeAvailableAmount(product: Product, cart: Cart): Promise<number> {
	const amountInCart = sum(
		cart.items.filter((item) => item.productId === product._id).map((item) => item.quantity)
	);

	return !product.stock
		? Infinity
		: product.stock.total +
				amountInCart -
				(await amountOfProductReserved(product._id, {
					sessionId: cart.sessionId,
					npub: cart.npub
				}));
}
