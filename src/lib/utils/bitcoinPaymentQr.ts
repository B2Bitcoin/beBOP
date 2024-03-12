import type { Currency } from '$lib/types/Currency';
import { toBitcoins } from './toBitcoins';

export function bitcoinPaymentQrCodeString(
	paymentAddress: string,
	paymentAmount: number,
	paymentCurrency: Currency
) {
	return `bitcoin:${paymentAddress}?amount=${toBitcoins(paymentAmount, paymentCurrency)
		.toLocaleString('en-US', { maximumFractionDigits: 8 })
		.replaceAll(',', '')}`;
}
