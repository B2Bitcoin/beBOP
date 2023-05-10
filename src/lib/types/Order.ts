import type { Decimal128 } from 'mongodb';
import type { Product } from './Product';
import type { Currency } from './Currency';
import type { CountryAlpha3 } from './Country';
import type { Timestamps } from './Timestamps';

export interface Order extends Timestamps {
	/**
	 * A string - a crypto UUID. Anyone having access to the _id can access the order.
	 */
	_id: string;
	sessionId: string;

	number: number;

	items: Array<{
		product: Product;
		quantity: number;
	}>;

	shippingAddress?: {
		firstName: string;
		lastName: string;
		address: string;
		city: string;
		state?: string;
		zip: string;
		country: CountryAlpha3;
	};

	totalPrice: {
		amount: Decimal128;
		currency: Currency;
	};

	payment: {
		method: 'bitcoin' | 'lightning';
		status: 'pending' | 'paid' | 'expired';
		expiresAt: Date;
		address: string;
		transactionIds?: string[];
		paidAt?: Date;
	};
}
