import type { Currency } from '$lib/types/Currency';
import type { Price } from '$lib/types/Order';
import { toCurrency } from './toCurrency';

export function toSatoshis(price: Price): number;
export function toSatoshis(amount: number, currency: Currency): number;
export function toSatoshis(amount: number | Price, currency?: Currency): number {
	if (typeof amount === 'number') {
		if (!currency) {
			throw new TypeError('Currency is required');
		}
		return toCurrency('SAT', amount, currency);
	}

	return toCurrency('SAT', amount.amount, amount.currency);
}
