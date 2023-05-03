import type { Decimal128 } from 'mongodb';
import type { Currency } from './Currency';
import type { Timestamps } from './Timestamps';

export interface Product extends Timestamps {
	_id: string;
	name: string;
	description: string;
	shortDescription: string;
	price: {
		amount: Decimal128;
		currency: Currency;
	};
	type: 'subscription' | 'resource' | 'donation';
	shipping: boolean;
	availableDate?: Date;
	preorder: boolean;
}

export type ProductFrontend = Omit<Product, 'price'> & {
	price: { amount: number; currency: Currency };
};

export type BasicProductFrontend = Pick<
	ProductFrontend,
	'_id' | 'shortDescription' | 'price' | 'name'
>;

export function productToFrontend<T extends { price: Product['price'] }>(
	product: T
): Omit<T, 'price'> & { price: ProductFrontend['price'] } {
	return {
		...product,
		price: {
			amount: parseFloat(product.price.amount.toString()),
			currency: product.price.currency
		}
	};
}
