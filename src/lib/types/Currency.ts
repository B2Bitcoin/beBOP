export const CURRENCIES = ['BTC', 'CHF', 'EUR', 'USD', 'SAT'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SATOSHIS_PER_BTC = 100_000_000;

export const MININUM_PER_CURRENCY = {
	BTC: 1 / SATOSHIS_PER_BTC,
	CHF: 0.01,
	EUR: 0.01,
	USD: 0.01,
	SAT: 1
} as const;

export const FRACTION_DIGITS_PER_CURRENCY = {
	BTC: 8,
	CHF: 2,
	EUR: 2,
	USD: 2,
	SAT: 0
} as const;
