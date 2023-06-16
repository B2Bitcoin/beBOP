import type { Currency } from './Currency';
import type { Timestamps } from './Timestamps';

export interface Challenge extends Timestamps {
	_id: string;
	name: string;

	/* If empty, works on all products */
	productIds: string[];
	goal: {
		currency: Currency;
		amount: number;
	};

	/**
	 * totalProducts: The goal is to sell a certain number of products
	 */
	mode: 'totalProducts' | 'moneyAmount';

	recurring: false | 'monthly';

	progress: number;

	beginsAt?: Date;
	endsAt: Date;
}
