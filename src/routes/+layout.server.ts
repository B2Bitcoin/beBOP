import { runtimeConfig } from '$lib/server/runtime-config';

export async function load() {
	return {
		exchangeRate: runtimeConfig.BTC_EUR
	};
}
