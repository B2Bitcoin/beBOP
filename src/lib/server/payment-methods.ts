import { POS_ROLE_ID } from '$lib/types/User';
import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';
import { runtimeConfig } from './runtime-config';

export const paymentMethods = (role?: string) => [
	...(isLightningConfigured ? (['lightning'] as const) : []),
	...(isBitcoinConfigured ? (['bitcoin'] as const) : []),
	...(runtimeConfig.enableCashSales && role === POS_ROLE_ID ? (['cash'] as const) : [])
];
