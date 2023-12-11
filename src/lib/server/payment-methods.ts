import { env } from '$env/dynamic/private';
import { POS_ROLE_ID } from '$lib/types/User';
import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';
import { runtimeConfig } from './runtime-config';
import { isSumupEnabled } from './sumup';

const ALL_PAYMENT_METHODS = ['lightning', 'bitcoin', 'cash', 'card', 'bankTransfer'] as const;
export type PaymentMethod = (typeof ALL_PAYMENT_METHODS)[number];

export const paymentMethods = (role?: string) =>
	env.VITEST
		? ALL_PAYMENT_METHODS
		: [
				...(isSumupEnabled() && role !== POS_ROLE_ID ? (['card'] as const) : []),
				...(runtimeConfig.sellerIdentity?.bank ? (['bankTransfer'] as const) : []),
				...(isBitcoinConfigured ? (['bitcoin'] as const) : []),
				...(isLightningConfigured ? (['lightning'] as const) : []),
				...(runtimeConfig.enableCashSales && role === POS_ROLE_ID ? (['cash'] as const) : [])
		  ];
