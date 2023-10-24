import { ObjectId, type WithId } from 'mongodb';
import { collections, withTransaction } from './database';
import { DEFAULT_MAX_QUANTITY_PER_ORDER, type Product } from '$lib/types/Product';
import { error } from '@sveltejs/kit';
import { runtimeConfig } from './runtime-config';
import { amountOfProductReserved, refreshAvailableStockInDb } from './product';
import type { Cart } from '$lib/types/Cart';
import { filterUndef } from '$lib/utils/filterUndef';
import type { Picture } from '$lib/types/Picture';
import type { DigitalFile } from '$lib/types/DigitalFile';

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
		let userId;

		if (params.sessionId) {
			const session = await collections.sessions.findOne({ sessionId: params.sessionId });

			if (session) {
				userId = session.userId;
			}
		}

		cart = {
			...query,
			_id: new ObjectId(),
			userId: userId,
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
						userId: validCart.userId,
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
	return !product.stock
		? Infinity
		: product.stock.total +
				(await amountOfProductReserved(product._id, {
					exclude: {
						sessionId: cart.sessionId,

						npub: cart.npub
					}
				}));
}

export async function checkCartItems(
	items: Array<{
		quantity: number;
		product: Pick<Product, 'stock' | '_id' | 'name' | 'maxQuantityPerOrder'>;
	}>,
	opts?: {
		sessionId?: string;
		npub?: string;
	}
) {
	const products = items.map((item) => item.product);
	const productById = Object.fromEntries(products.map((product) => [product._id, product]));

	// be careful, there can be multiple lines for the same product due to product.standalone
	const qtyPerItem: Record<string, number> = {};
	for (const item of items) {
		qtyPerItem[item.product._id] = (qtyPerItem[item.product._id] || 0) + item.quantity;
	}

	for (const productId of Object.keys(qtyPerItem)) {
		const product = productById[productId];
		const available = product.stock
			? product.stock.total -
			  (await amountOfProductReserved(productId, {
					exclude: {
						npub: opts?.npub,
						sessionId: opts?.sessionId
					}
			  }))
			: Infinity;
		if (product.stock && qtyPerItem[productId] > available) {
			if (!available) {
				throw error(400, 'Product is out of stock: ' + product.name);
			}
			throw error(
				400,
				'Not enough stock for product: ' + product.name + ', only ' + available + ' left'
			);
		}

		if (qtyPerItem[productId] > (product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER)) {
			throw error(
				400,
				'Cannot order more than ' +
					(product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER) +
					' of product: ' +
					product.name
			);
		}
	}
}

type FormattedCartItem = {
	product: Pick<
		Product,
		| 'stock'
		| '_id'
		| 'name'
		| 'maxQuantityPerOrder'
		| 'deliveryFees'
		| 'price'
		| 'shortDescription'
		| 'type'
		| 'availableDate'
		| 'shipping'
		| 'preorder'
		| 'applyDeliveryFeesOnlyOnce'
		| 'requireSpecificDeliveryFee'
		| 'payWhatYouWant'
		| 'standalone'
	>;
	picture: Picture | null;
	digitalFiles: WithId<DigitalFile>[];
	quantity: number;
	customPrice?: {
		amount: number;
		currency: 'BTC' | 'CHF' | 'EUR' | 'USD' | 'SAT';
	};
};

export async function formatCart(cart: WithId<Cart> | null): Promise<FormattedCartItem[]> {
	if (cart && cart.items) {
		return await Promise.all(
			cart?.items.map(async (item) => {
				const productDoc = await collections.products.findOne<
					Pick<
						Product,
						| '_id'
						| 'name'
						| 'price'
						| 'shortDescription'
						| 'type'
						| 'availableDate'
						| 'shipping'
						| 'preorder'
						| 'deliveryFees'
						| 'applyDeliveryFeesOnlyOnce'
						| 'requireSpecificDeliveryFee'
						| 'payWhatYouWant'
						| 'standalone'
						| 'maxQuantityPerOrder'
						| 'stock'
					>
				>(
					{ _id: item.productId },
					{
						projection: {
							_id: 1,
							name: 1,
							price: 1,
							shortDescription: 1,
							type: 1,
							shipping: 1,
							availableDate: 1,
							preorder: 1,
							deliveryFees: 1,
							applyDeliveryFeesOnlyOnce: 1,
							requireSpecificDeliveryFee: 1,
							payWhatYouWant: 1,
							standalone: 1,
							maxQuantityPerOrder: 1,
							stock: 1
						}
					}
				);
				if (productDoc) {
					if (runtimeConfig.deliveryFees.mode !== 'perItem') {
						delete productDoc.deliveryFees;
					}
					return {
						product: productDoc,
						picture: await collections.pictures.findOne(
							{ productId: item.productId },
							{ sort: { createdAt: 1 } }
						),
						digitalFiles: await collections.digitalFiles
							.find({ productId: item.productId })
							.sort({ createdAt: 1 })
							.toArray(),
						quantity: item.quantity,
						...(item.customPrice && { customPrice: item.customPrice })
					};
				}
			})
		).then((res) => filterUndef(res));
	}

	return [];
}
