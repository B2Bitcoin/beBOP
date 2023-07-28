import type { CountryAlpha2 } from './Country';
import type { Currency } from './Currency';

export type DeliveryFees = Partial<
	Record<CountryAlpha2 | 'default', { amount: number; currency: Currency }>
>;
