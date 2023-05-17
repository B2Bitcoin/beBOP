import { isBitcoinConfigured } from './bitcoin';
import { isLightningConfigured } from './lightning';

export const paymentMethods = [
	...(isBitcoinConfigured ? (['bitcoin'] as const) : []),
	...(isLightningConfigured ? (['lightning'] as const) : [])
];
