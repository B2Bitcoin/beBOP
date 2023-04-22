import { runtimeConfig } from '$lib/server/runtime-config';
import { UrlDependency } from '$lib/types/UrlDependecy';

export async function load({ depends }) {
	depends(UrlDependency.ExchangeRate);

	return {
		exchangeRate: runtimeConfig.BTC_EUR
	};
}
