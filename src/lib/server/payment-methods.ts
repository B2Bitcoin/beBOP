import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';
import { runtimeConfig } from './runtime-config';

export const paymentMethods = () => [
	...(isLightningConfigured ? (['lightning'] as const) : []),
	...(isBitcoinConfigured ? (['bitcoin'] as const) : []),
	...(runtimeConfig.enableCashSales ? (['cash'] as const) : [])
];
