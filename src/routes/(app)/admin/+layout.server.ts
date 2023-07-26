import { runtimeConfig } from '$lib/server/runtime-config';

export async function load() {
	return {
		priceReferenceCurrency: runtimeConfig.priceReferenceCurrency,
		deliveryFees: runtimeConfig.deliveryFees
	};
}
