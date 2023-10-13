import { runtimeConfig } from '$lib/server/runtime-config';

export async function load() {
	/**
	 * Warning: do not send sensitive data here, it will be sent to the client on /admin/login!
	 */
	return {
		deliveryFees: runtimeConfig.deliveryFees
	};
}
