import { Currency } from './Currency';
import type { Timestamps } from './Timestamps';

export type Leaderboard = Timestamps & {
	_id: string;
	name: string;

	/* If empty, works on all products */
	productIds: string[];

	progress: number;

	beginsAt: Date;
	endsAt: Date;
	mode: 'moneyAmount' | 'totalProducts';
	currency?: Currency;
};
