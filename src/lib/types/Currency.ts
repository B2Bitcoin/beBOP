export const CURRENCIES = ['BTC', 'CHF', 'EUR', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];
