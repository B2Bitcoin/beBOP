import { env } from '$env/dynamic/private';
import { POS_ROLE_ID } from '$lib/types/User';
import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lnd';
import { isPhoenixdConfigured } from './phoenixd';
import { runtimeConfig } from './runtime-config';
import { isSumupEnabled } from './sumup';

const ALL_PAYMENT_METHODS = [
	'card',
	'bank-transfer',
	'bitcoin',
	'lightning',
	'point-of-sale',
	'free'
] as const;
export type PaymentMethod = (typeof ALL_PAYMENT_METHODS)[number];

export type PaymentProcessor = 'sumup' | 'bitcoind' | 'lnd' | 'phoenixd';

export const paymentMethods = (opts?: {
	role?: string;
	includePOS?: boolean;
	includeDisabled?: boolean;
	totalSatoshis?: number;
}) =>
	env.VITEST
		? [...ALL_PAYMENT_METHODS]
		: [...new Set([...runtimeConfig.paymentMethods.order, ...ALL_PAYMENT_METHODS])].filter(
				(method) => {
					if (!opts?.includeDisabled && runtimeConfig.paymentMethods.disabled.includes(method)) {
						return false;
					}
					if (opts?.totalSatoshis !== undefined && opts.totalSatoshis === 0) {
						return method === 'free';
					}
					switch (method) {
						case 'card':
							return isSumupEnabled();
						case 'bank-transfer':
							return runtimeConfig.sellerIdentity?.bank;
						case 'bitcoin':
							return isBitcoinConfigured;
						case 'lightning':
							return isLightningConfigured || isPhoenixdConfigured();
						case 'point-of-sale':
							return opts?.role === POS_ROLE_ID || opts?.includePOS;
						case 'free':
							return opts?.totalSatoshis === undefined;
					}
				}
		  );
