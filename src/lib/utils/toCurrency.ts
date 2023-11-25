import { exchangeRate } from '$lib/stores/exchangeRate';
import { FRACTION_DIGITS_PER_CURRENCY, type Currency } from '$lib/types/Currency';
import { get } from 'svelte/store';

export function toCurrency(
	targetCurrency: Currency,
	amount: number,
	fromCurrency: Currency
): number {
	// Just fix the rounding if the currencies are the same
	if (fromCurrency === targetCurrency) {
		return (
			Math.round(amount * Math.pow(10, FRACTION_DIGITS_PER_CURRENCY[targetCurrency])) /
			Math.pow(10, FRACTION_DIGITS_PER_CURRENCY[targetCurrency])
		);
	}

	const bitcoinAmount = fromCurrency === 'BTC' ? amount : amount / get(exchangeRate)[fromCurrency];

	const ret =
		targetCurrency === 'BTC' ? bitcoinAmount : bitcoinAmount * get(exchangeRate)[targetCurrency];

	return (
		Math.round(ret * Math.pow(10, FRACTION_DIGITS_PER_CURRENCY[targetCurrency])) /
		Math.pow(10, FRACTION_DIGITS_PER_CURRENCY[targetCurrency])
	);
}
