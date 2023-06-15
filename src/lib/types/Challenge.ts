import type { Currency } from './Currency';
import type { Timestamps } from './Timestamps';

export interface Challenge extends Timestamps {
	_id: string;
	name: string;
	/* If empty, works on all products */
	productId: string[];
	goal: {
		currency: Currency;
		amount: number;
	};
	progress: {
		currency: Currency;
		amount: number;
	};
	mode: 'money amount' | 'order quantity';
	endsAt: Date;
}
