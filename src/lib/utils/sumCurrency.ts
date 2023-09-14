import { currencies } from '$lib/stores/currencies';
import type { Currency } from '$lib/types/Currency';
import { get } from 'svelte/store';
import { toCurrency } from './toCurrency';
import { sum } from './sum';

/**
 * Sum currencies, using the priceReferenceCurrency as intermediary
 */
export function sumCurrency(to: Currency, items: Array<{ amount: number; currency: Currency }>) {
	const refCurrency = get(currencies).priceReference;

	const amounts = items.map((item) => toCurrency(refCurrency, item.amount, item.currency));

	return toCurrency(to, sum(amounts), refCurrency);
}
