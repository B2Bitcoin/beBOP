import { exchangeRate } from '$lib/stores/exchangeRate';
import type { Currency } from '$lib/types/Currency';
import { get } from 'svelte/store';

export function toCurrency(
	targetCurrency: Currency,
	amount: number,
	fromCurrency: Currency
): number {
	if (fromCurrency === targetCurrency) {
		return amount;
	}

	const bitcoinAmount =
		fromCurrency === 'BTC' ? amount : amount / get(exchangeRate)[`BTC_${fromCurrency}` as const];

	return targetCurrency === 'BTC'
		? bitcoinAmount
		: bitcoinAmount * get(exchangeRate)[`BTC_${targetCurrency}` as const];
}
