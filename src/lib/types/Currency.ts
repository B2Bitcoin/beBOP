import { error } from '@sveltejs/kit';

export const CURRENCIES = ['BTC', 'CHF', 'EUR', 'USD', 'ZAR', 'SAT', 'XOF', 'XAF', 'CDF'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SATOSHIS_PER_BTC = 100_000_000;

export const MININUM_PER_CURRENCY = Object.freeze({
	BTC: 1 / SATOSHIS_PER_BTC,
	CHF: 0.01,
	EUR: 0.01,
	USD: 0.01,
	ZAR: 0.01,
	XOF: 0.01,
	XAF: 0.01,
	CDF: 0.01,
	SAT: 1
}) satisfies Record<Currency, number>;

export const FRACTION_DIGITS_PER_CURRENCY = Object.freeze({
	BTC: 8,
	CHF: 2,
	EUR: 2,
	USD: 2,
	ZAR: 2,
	XOF: 2,
	XAF: 2,
	CDF: 2,
	SAT: 0
}) satisfies Record<Currency, number>;

export function parsePriceAmount(amount: string, currency: Currency): number {
	//deleted Math.round()
	const priceAmount =
		(parseFloat(amount) * Math.pow(10, FRACTION_DIGITS_PER_CURRENCY[currency])) /
		Math.pow(10, FRACTION_DIGITS_PER_CURRENCY[currency]);
	if (priceAmount > 0 && priceAmount <= MININUM_PER_CURRENCY[currency]) {
		throw error(
			400,
			`Price must be zero or greater than ${MININUM_PER_CURRENCY[currency]} ${currency}`
		);
	}

	return priceAmount;
}

/**
 * When computing VAT, delivery fees, etc, convert everything to SAT and only display
 * the result in the user's currency.
 */
export const UNDERLYING_CURRENCY = 'SAT';
