import {
	lndActivateAutopilot,
	lndAutopilotActive,
	lndChannelsBalance,
	lndGetInfo,
	lndListChannels,
	lndWalletBalance
} from '$lib/server/lightning.js';
import { runtimeConfig } from '$lib/server/runtime-config.js';

export async function load() {
	return {
		info: lndGetInfo(),
		walletBalance: lndWalletBalance(),
		channelsBalance: lndChannelsBalance(),
		channels: lndListChannels(),
		autopilotActive: lndAutopilotActive(),
		priceReferenceCurrency: runtimeConfig.priceReferenceCurrency
	};
}

export const actions = {
	activateAutopilot: async function () {
		await lndActivateAutopilot();
	}
};
