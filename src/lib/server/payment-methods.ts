import { env } from '$env/dynamic/private';
import { POS_ROLE_ID } from '$lib/types/User';
import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';
import { runtimeConfig } from './runtime-config';
import { isSumupEnabled } from './sumup';

const ALL_PAYMENT_METHODS = ['lightning', 'bitcoin', 'cash', 'card', 'bankTransfert'] as const;
export type PaymentMethod = (typeof ALL_PAYMENT_METHODS)[number];

export const paymentMethods = (role?: string) =>
	env.VITEST
		? ALL_PAYMENT_METHODS
		: [
				...(isLightningConfigured ? (['lightning'] as const) : []),
				...(isBitcoinConfigured ? (['bitcoin'] as const) : []),
				...(runtimeConfig.enableCashSales && role === POS_ROLE_ID ? (['cash'] as const) : []),
				...(isSumupEnabled() && role !== POS_ROLE_ID ? (['card'] as const) : []),
				'bankTransfert' as const
		  ];
