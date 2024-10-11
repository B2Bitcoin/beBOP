import type { Currency } from './Currency';
import type { Order } from './Order';
import type { Timestamps } from './Timestamps';

export type Challenge = Timestamps & {
	_id: string;
	name: string;

	/* If empty, works on all products */
	productIds: string[];

	recurring: false | 'monthly';

	progress: number;

	beginsAt: Date;
	endsAt: Date;
	incrementation?: {
		incrementedDate: Date;
		order: Order['_id'];
		increment: number;
	}[];
} & (
		| {
				goal: {
					amount: number;
					currency?: undefined;
				};

				/**
				 * totalProducts: The goal is to sell a certain number of products
				 */
				mode: 'totalProducts';
		  }
		| {
				goal: {
					currency: Currency;
					amount: number;
				};

				/**
				 * moneyAmount: The goal is to earn a certain amount of money
				 */
				mode: 'moneyAmount';
		  }
	);
