import { writable } from 'svelte/store';
import type { RuntimeConfig } from '$lib/server/runtime-config';
import { SATOSHIS_PER_BTC } from '$lib/types/Currency';

export const exchangeRate = writable<RuntimeConfig['exchangeRate']>({
	EUR: 30_000,
	CHF: 30_000,
	USD: 30_000,
	ZAR: 700_000,
	CDF: 96_755_481,
	XOF: 22_621_258,
	XAF: 22_621_258,
	SAT: SATOSHIS_PER_BTC
});
