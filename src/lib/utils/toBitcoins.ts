import { SATOSHIS_PER_BTC, type Currency } from '$lib/types/Currency';

export function toBitcoins(amount: number, currency: Currency, rate?: number) {
	if (currency === 'SAT') {
		return amount / SATOSHIS_PER_BTC;
	}

	if (currency === 'BTC') {
		return amount;
	}

	if (!rate) {
		throw new Error('exchange rate needed');
	}

	return amount / rate;
}
