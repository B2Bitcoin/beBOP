import { runtimeConfig } from '$lib/server/runtime-config';
import { toSatoshis } from '../utils/toSatoshis';

export function getConfirmationBlocks(orderAmountSats: number) {
	let confirmationBlocks = runtimeConfig.confirmationBlocksThresholds.defaultBlocks;

	for (const threshold of runtimeConfig.confirmationBlocksThresholds.thresholds) {
		const minAmountInSat = toSatoshis(
			threshold.minAmount,
			runtimeConfig.confirmationBlocksThresholds.currency
		);
		const maxAmountInSat = toSatoshis(
			threshold.maxAmount,
			runtimeConfig.confirmationBlocksThresholds.currency
		);

		if (orderAmountSats >= minAmountInSat && orderAmountSats <= maxAmountInSat) {
			confirmationBlocks = threshold.confirmationBlocks;
			break;
		}
	}

	return confirmationBlocks;
}
