import type { Timestamps } from './Timestamps';

export interface Discount extends Timestamps {
	_id: string;
	name: string;
	/* If empty, works on all products */
	productIds: string[];
	percentage: number;
	beginsAt: Date;
	endsAt: Date;
}
