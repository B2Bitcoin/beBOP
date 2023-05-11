import type { Currency } from './Currency';
import type { Timestamps } from './Timestamps';

export interface Product extends Timestamps {
	_id: string;
	name: string;
	description: string;
	shortDescription: string;
	price: {
		amount: number;
		currency: Currency;
	};
	type: 'subscription' | 'resource' | 'donation';
	shipping: boolean;
	availableDate?: Date;
	preorder: boolean;
}

export type BasicProductFrontend = Pick<Product, '_id' | 'shortDescription' | 'price' | 'name'>;
