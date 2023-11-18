import { describe, beforeEach, it, expect } from 'vitest';
import { collections } from './database';
import { cleanDb } from './test-utils';
import { addToCartInDb } from './cart';
import type { Product } from '$lib/types/Product';

describe('cart', () => {
	beforeEach(async () => {
		await cleanDb();
		await collections.products.insertOne(testProduct);
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
		expect(
			addToCartInDb(testProduct, 10, {
				user: {
					sessionId: 'test-session-id'
				}
			})
		).rejects.toThrow(`You can only order ${testProduct.stock.total} of this product`);
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
		available: 5,
		total: 5,
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
