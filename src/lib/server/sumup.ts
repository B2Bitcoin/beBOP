import { runtimeConfig } from './runtime-config';

export const isSumupEnabled = () =>
	!!runtimeConfig.sumUp.apiKey && !!runtimeConfig.sumUp.merchantCode;
