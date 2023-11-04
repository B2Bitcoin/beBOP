import type { Currency } from './Currency';

export type ConfirmationThresholds = {
	_id: string;
	minAmount: number;
	currency: Currency;
	maxAmount: number;
	confirmationBlocks: number;
};
