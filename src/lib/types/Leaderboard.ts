import type { Currency } from './Currency';
import type { Order } from './Order';
import type { Product } from './Product';
import type { Timestamps } from './Timestamps';

export type Leaderboard = Timestamps & {
	_id: string;
	name: string;

	/* If empty, works on all products */
	productIds: string[];

	beginsAt: Date;
	endsAt: Date;
	mode: 'moneyAmount' | 'totalProducts';
	progress: {
		product: Product['_id'];
		amount: number;
		currency?: Currency;
	}[];
	event?: {
		type: 'progress';
		at: Date;
		order: Order['_id'];
		amount: number;
	}[];
};
