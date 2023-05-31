export const CURRENCIES = ['BTC', 'CHF', 'EUR', 'USD', 'SAT'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SATOSHIS_PER_BTC = 100_000_000;
