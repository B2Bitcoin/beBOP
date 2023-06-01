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

export const MAX_NAME_LIMIT = 70;

export const MAX_SHORT_DESCRIPTION_LIMIT = 160;
