import { writable } from 'svelte/store';
import type { LayoutData } from '../../routes/(app)/$types';
import { SATOSHIS_PER_BTC } from '$lib/types/Currency';

export const exchangeRate = writable<LayoutData['exchangeRate']>({
	BTC_EUR: 30_000,
	BTC_USD: 30_000,
	BTC_CHF: 30_000,
	BTC_SAT: SATOSHIS_PER_BTC
});
