import { env } from '$env/dynamic/private';
import { SUMUP_API_KEY } from '$env/static/private';
import { POS_ROLE_ID } from '$lib/types/User';
import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';
import { runtimeConfig } from './runtime-config';

export const paymentMethods = (role?: string) =>
	env.VITEST
		? (['lightning', 'bitcoin', 'cash', 'card'] as const)
		: [
				...(isLightningConfigured ? (['lightning'] as const) : []),
				...(isBitcoinConfigured ? (['bitcoin'] as const) : []),
				...(runtimeConfig.enableCashSales && role === POS_ROLE_ID ? (['cash'] as const) : []),
				...(SUMUP_API_KEY && role !== POS_ROLE_ID ? (['card'] as const) : [])
		  ];
