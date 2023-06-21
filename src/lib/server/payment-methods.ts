import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';
import { runtimeConfig } from './runtime-config';

export const paymentMethods = () => [
	...(isBitcoinConfigured ? (['bitcoin'] as const) : []),
	...(isLightningConfigured ? (['lightning'] as const) : []),
	...(runtimeConfig.enableCashSales ? (['cash'] as const) : [])
];
