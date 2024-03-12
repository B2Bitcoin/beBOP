import type { Currency } from '$lib/types/Currency';
import { toBitcoins } from './toBitcoins';

export function paymentQrCodeString(
	paymentAddress: string | undefined,
	paymentAmount: number,
	paymentCurrency: Currency
) {
	return `bitcoin:${paymentAddress ?? ''}?amount=${toBitcoins(paymentAmount, paymentCurrency)
		.toLocaleString('en-US', { maximumFractionDigits: 8 })
		.replaceAll(',', '')}`;
}
