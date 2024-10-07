import { runtimeConfig } from './runtime-config';

export function isBitcoinNodelessConfigured(): boolean {
	return !!runtimeConfig.bitcoinNodeless.zpub;
}
