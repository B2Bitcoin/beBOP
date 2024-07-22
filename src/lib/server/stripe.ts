import { runtimeConfig } from './runtime-config';

export const isStripeEnabled = () =>
	!!runtimeConfig.stripe.publicKey && !!runtimeConfig.stripe.secretKey;
