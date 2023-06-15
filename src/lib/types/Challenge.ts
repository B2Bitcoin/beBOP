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
	progress: number;
	mode: 'money amount' | 'order quantity';
	endsAt: Date;
}
