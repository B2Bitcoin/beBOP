import type { Currency } from '$lib/types/Currency';
import { toCurrency } from './toCurrency';

export function fixCurrencyRounding(amount: number, currency: Currency) {
	return toCurrency(currency, amount, currency);
}
