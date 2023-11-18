import { describe, beforeEach, it, expect, assert } from 'vitest';
import { collections } from './database';
import { cleanDb } from './test-utils';
import { addToCartInDb } from './cart';
import type { Product } from '$lib/types/Product';
import { createOrder } from './orders';
import { HttpError_1 } from '@sveltejs/kit';

const LIMITED_STOCK = 5;

describe('cart', () => {
	beforeEach(async () => {
		await cleanDb();
		await collections.products.insertMany([testProduct, testProductUnlimited]);
	});

	it('should add a product to the cart', async () => {
		await addToCartInDb(testProduct, 1, {
			user: {
				sessionId: 'test-session-id'
			}
		});

		expect(await collections.carts.countDocuments({ 'user.sessionId': 'test-session-id' })).toBe(1);
	});

	it('should fail to add a product to the cart when no stock', async () => {
		await expect(
			addToCartInDb(testProduct, 10, {
				user: {
					sessionId: 'test-session-id'
				}
			})
		).rejects.toThrow(HttpError_1);
	});

	it('should prevent adding a product when reserved by another user', async () => {
		await addToCartInDb(testProduct, LIMITED_STOCK, {
			user: {
				sessionId: 'test-session-id'
			}
		});
		await expect(
			addToCartInDb(testProduct, LIMITED_STOCK, {
				user: {
					sessionId: 'test-session-id2'
				}
			})
		).rejects.toThrow(HttpError_1);
	});

	it('should allow checking out a product when the reservation is expired', async () => {
		await addToCartInDb(testProduct, LIMITED_STOCK, {
			user: {
				sessionId: 'test-session-id'
			}
		});
		const cart = await collections.carts.findOne({ 'user.sessionId': 'test-session-id' });
		assert(cart, 'Cart should exist');
		cart.items[0].reservedUntil = new Date(0);
		await collections.carts.updateOne({ _id: cart._id }, { $set: { items: cart.items } });
		await addToCartInDb(testProduct, LIMITED_STOCK, {
			user: {
				sessionId: 'test-session-id2'
			}
		});
		// Refresh first cart
		await addToCartInDb(testProductUnlimited, 1, {
			user: {
				sessionId: 'test-session-id'
			}
		});
		const cart2 = await collections.carts.findOne({ 'user.sessionId': 'test-session-id2' });
		assert(cart2, 'Cart 2 should exist');
		// Second user should be able to check out
		await expect(
			createOrder(
				[
					{
						quantity: LIMITED_STOCK,
						product: testProduct
					}
				],
				'cash',
				{
					cart: cart2,
					user: {
						sessionId: 'test-session-id2'
					},
					vatCountry: 'FR',
					shippingAddress: null
				}
			)
		).resolves.toBeDefined();
	});
});

const testProduct = {
	_id: 'test-product',
	name: 'Test product',
	description: 'Test product description',
	shortDescription: 'Test product short description',
	type: 'resource',
	price: {
		amount: 100,
		currency: 'EUR'
	},
	shipping: false,
	preorder: false,
	free: false,
	standalone: false,
	stock: {
		available: LIMITED_STOCK,
		total: LIMITED_STOCK,
		reserved: 0
	},
	displayShortDescription: true,
	payWhatYouWant: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	actionSettings: {
		eShop: {
			visible: true,
			canBeAddedToBasket: true
		},
		googleShopping: {
			visible: true
		},
		retail: {
			visible: true,
			canBeAddedToBasket: true
		}
	}
} satisfies Product;

const testProductUnlimited = {
	_id: 'test-product-unlimited',
	name: 'Test product',
	description: 'Test product description',
	shortDescription: 'Test product short description',
	type: 'resource',
	price: {
		amount: 100,
		currency: 'EUR'
	},
	shipping: false,
	preorder: false,
	free: false,
	standalone: false,
	displayShortDescription: true,
	payWhatYouWant: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	actionSettings: {
		eShop: {
			visible: true,
			canBeAddedToBasket: true
		},
		googleShopping: {
			visible: true
		},
		retail: {
			visible: true,
			canBeAddedToBasket: true
		}
	}
} satisfies Product;
