import type { Currency } from './Currency';

export type ConfirmationThresholds = {
	currency: Currency;
	defaultBlocks: number;

	thresholds: Array<{
		minAmount: number;
		maxAmount: number;
		confirmationBlocks: number;
	}>;
};
