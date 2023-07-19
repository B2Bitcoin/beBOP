import type { CountryAlpha3 } from './Country';
import type { Currency } from './Currency';

export type DeliveryFees = Partial<
	Record<CountryAlpha3 | 'default', { amount: number; currency: Currency }>
>;
