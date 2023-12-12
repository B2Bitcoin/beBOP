import { describe, beforeEach, it, expect, assert } from 'vitest';
import { collections } from './database';
import { cleanDb } from './test-utils';
import { addToCartInDb } from './cart';
import { createOrder } from './orders';
import { HttpError_1 } from '@sveltejs/kit';
import { TEST_PRODUCT, TEST_PRODUCT_STOCK, TEST_PRODUCT_UNLIMITED } from './seed/product';

describe('cart', () => {
	beforeEach(async () => {
		await cleanDb();
		await collections.products.insertMany([TEST_PRODUCT, TEST_PRODUCT_UNLIMITED]);
	});

	it('should add a product to the cart', async () => {
		await addToCartInDb(TEST_PRODUCT, 1, {
			user: {
				sessionId: 'test-session-id'
			}
		});

		expect(await collections.carts.countDocuments({ 'user.sessionId': 'test-session-id' })).toBe(1);
	});

	it('should fail to add a product to the cart when no stock', async () => {
		await expect(
			addToCartInDb(TEST_PRODUCT, 10, {
				user: {
					sessionId: 'test-session-id'
				}
			})
		).rejects.toThrow(HttpError_1);
	});

	it('should prevent adding a product when reserved by another user', async () => {
		await addToCartInDb(TEST_PRODUCT, TEST_PRODUCT_STOCK, {
			user: {
				sessionId: 'test-session-id'
			}
		});
		await expect(
			addToCartInDb(TEST_PRODUCT, TEST_PRODUCT_STOCK, {
				user: {
					sessionId: 'test-session-id2'
				}
			})
		).rejects.toThrow(HttpError_1);
	});

	it('should allow checking out a product when the reservation is expired', async () => {
		await addToCartInDb(TEST_PRODUCT, TEST_PRODUCT_STOCK, {
			user: {
				sessionId: 'test-session-id'
			}
		});
		const cart = await collections.carts.findOne({ 'user.sessionId': 'test-session-id' });
		assert(cart, 'Cart should exist');
		cart.items[0].reservedUntil = new Date(0);
		await collections.carts.updateOne({ _id: cart._id }, { $set: { items: cart.items } });
		await addToCartInDb(TEST_PRODUCT, TEST_PRODUCT_STOCK, {
			user: {
				sessionId: 'test-session-id2'
			}
		});
		// Refresh first cart
		await addToCartInDb(TEST_PRODUCT_UNLIMITED, 1, {
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
						quantity: TEST_PRODUCT_STOCK,
						product: TEST_PRODUCT
					}
				],
				'point-of-sale',
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
