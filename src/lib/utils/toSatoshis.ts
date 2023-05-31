import { SATOSHIS_PER_BTC, type Currency } from '$lib/types/Currency';

export function toSatoshis(amount: number, currency: Currency, rate?: number) {
	if (currency === 'SAT') {
		return amount;
	}

	if (currency === 'BTC') {
		return Math.round(amount * SATOSHIS_PER_BTC);
	}

	if (!rate) {
		throw new Error('exchange rate needed');
	}

	return Math.round((amount * SATOSHIS_PER_BTC) / rate);
}
