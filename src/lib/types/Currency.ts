import { error } from '@sveltejs/kit';

export const CURRENCIES = ['BTC', 'CHF', 'EUR', 'USD', 'ZAR', 'SAT', 'XOF', 'XAF', 'CDF'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SATOSHIS_PER_BTC = 100_000_000;

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

export const CURRENCY_UNIT = Object.freeze({
	BTC: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.BTC),
	CHF: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.CHF),
	EUR: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.EUR),
	USD: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.USD),
	ZAR: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.ZAR),
	XOF: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.XOF),
	XAF: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.XAF),
	CDF: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.CDF),
	SAT: Math.pow(10, -FRACTION_DIGITS_PER_CURRENCY.SAT)
}) satisfies Record<Currency, number>;

export function parsePriceAmount(amount: string, currency: Currency): number {
	//deleted Math.round()
	const priceAmount =
		(parseFloat(amount) * Math.pow(10, FRACTION_DIGITS_PER_CURRENCY[currency])) /
		Math.pow(10, FRACTION_DIGITS_PER_CURRENCY[currency]);
	if (priceAmount > 0 && priceAmount < CURRENCY_UNIT[currency]) {
		throw error(400, `Price must be zero or greater than ${CURRENCY_UNIT[currency]} ${currency}`);
	}

	return priceAmount;
}

/**
 * When computing VAT, delivery fees, etc, convert everything to SAT and only display
 * the result in the user's currency.
 */
export const UNDERLYING_CURRENCY = 'SAT';
