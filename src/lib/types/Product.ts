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
}

export type ProductFrontend = Omit<Product, 'price'> & {
	price: { amount: number; currency: Currency };
};

export function productToFrontend(product: Product): ProductFrontend {
	return {
		...product,
		price: {
			amount: parseFloat(product.price.amount.toString()),
			currency: product.price.currency
		}
	};
}
