import type { Currency } from '$lib/types/Currency';
import { toCurrency } from './toCurrency';
import { sum } from './sum';

/**
 * Sum currencies, using the priceReferenceCurrency as intermediary
 */
export function sumCurrency(to: Currency, items: Array<{ amount: number; currency: Currency }>) {
	const refCurrency = 'SAT'; //get(currencies).priceReference;

	const amounts = items.map((item) => toCurrency(refCurrency, item.amount, item.currency));

	return toCurrency(to, sum(amounts), refCurrency);
}
