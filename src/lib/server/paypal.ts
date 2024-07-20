import { runtimeConfig } from './runtime-config';

export function isPaypalEnabled() {
	return !!runtimeConfig.paypal.clientId && !!runtimeConfig.paypal.secret;
}
