import type { Currency } from '$lib/types/Currency';
import { toCurrency } from './toCurrency';

export function toSatoshis(amount: number, currency: Currency) {
	return toCurrency('SAT', amount, currency);
}
