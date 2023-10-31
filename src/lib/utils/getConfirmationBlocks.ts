import { runtimeConfig } from '$lib/server/runtime-config';
import { toSatoshis } from './toSatoshis';

export function getConfirmationBlocks(orderAmount: number) {
	let confirmationBlocks = runtimeConfig.confirmationBlocks;

	for (const threshold of runtimeConfig.confirmationBlocksThresholds) {
		const minAmountInSat = toSatoshis(threshold.minAmount, threshold.currency);
		const maxAmountInSat = toSatoshis(threshold.maxAmount, threshold.currency);

		if (orderAmount >= minAmountInSat && orderAmount <= maxAmountInSat) {
			confirmationBlocks = threshold.confirmationBlocks;
			break;
		}
	}

	return confirmationBlocks;
}
