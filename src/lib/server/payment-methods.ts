import { env } from '$env/dynamic/private';
import { POS_ROLE_ID } from '$lib/types/User';
import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';
import { runtimeConfig } from './runtime-config';
import { isSumupEnabled } from './sumup';

const ALL_PAYMENT_METHODS = [
	'card',
	'bank-transfer',
	'bitcoin',
	'lightning',
	'point-of-sale'
] as const;
export type PaymentMethod = (typeof ALL_PAYMENT_METHODS)[number];

export const paymentMethods = (role?: string, includePOSAndDisabled?: boolean) =>
	env.VITEST
		? ALL_PAYMENT_METHODS
		: [...new Set([...runtimeConfig.paymentMethods.order, ...ALL_PAYMENT_METHODS])].filter(
				(method) => {
					if (!includePOSAndDisabled && runtimeConfig.paymentMethods.disabled.includes(method)) {
						return false;
					}
					switch (method) {
						case 'card':
							return isSumupEnabled();
						case 'bank-transfer':
							return runtimeConfig.sellerIdentity?.bank;
						case 'bitcoin':
							return isBitcoinConfigured;
						case 'lightning':
							return isLightningConfigured;
						case 'point-of-sale':
							return role === POS_ROLE_ID || includePOSAndDisabled;
					}
				}
		  );
