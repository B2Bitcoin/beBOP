import { env } from '$env/dynamic/private';
import { POS_ROLE_ID } from '$lib/types/User';
import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';
import { runtimeConfig } from './runtime-config';
import { isSumupEnabled } from './sumup';

const ALL_PAYMENT_METHODS = [
	'lightning',
	'bitcoin',
	'point-of-sale',
	'card',
	'bank-transfer'
] as const;
export type PaymentMethod = (typeof ALL_PAYMENT_METHODS)[number];

export const paymentMethods = (role?: string) =>
	env.VITEST
		? ALL_PAYMENT_METHODS
		: [
				...(isSumupEnabled() /* && role !== POS_ROLE_ID */ ? (['card'] as const) : []),
				...(runtimeConfig.sellerIdentity?.bank ? (['bank-transfer'] as const) : []),
				...(isBitcoinConfigured ? (['bitcoin'] as const) : []),
				...(isLightningConfigured ? (['lightning'] as const) : []),
				...(role === POS_ROLE_ID ? (['point-of-sale'] as const) : [])
		  ];
