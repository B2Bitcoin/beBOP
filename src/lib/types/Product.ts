import type { Timestamps } from './Timestamps';

export interface Product extends Timestamps {
	_id: string;
	name: string;
	description: string;
	price: number;
	state: 'draft' | 'published';
	stock: number;
}
