import type { Product } from '$lib/types/Product';

export const TEST_PRODUCT_STOCK = 5;

export const TEST_PRODUCT = {
	_id: 'test-product',
	name: 'Test product',
	description: 'Test product description',
	shortDescription: 'Test product short description',
	type: 'resource',
	price: {
		amount: 100,
		currency: 'EUR'
	},
	priceondemand: false,
	shipping: false,
	preorder: false,
	free: false,
	standalone: false,
	stock: {
		available: TEST_PRODUCT_STOCK,
		total: TEST_PRODUCT_STOCK,
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

export const TEST_PRODUCT_UNLIMITED = {
	_id: 'test-product-unlimited',
	name: 'Test product',
	description: 'Test product description',
	shortDescription: 'Test product short description',
	type: 'resource',
	price: {
		amount: 100,
		currency: 'EUR'
	},
	priceondemand: false,
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
