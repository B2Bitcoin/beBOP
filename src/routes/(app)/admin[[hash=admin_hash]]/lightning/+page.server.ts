import {
	lndActivateAutopilot,
	lndAutopilotActive,
	lndChannelsBalance,
	lndGetInfo,
	lndListChannels,
	lndWalletBalance
} from '$lib/server/lightning';

export async function load() {
	return {
		info: lndGetInfo(),
		walletBalance: lndWalletBalance(),
		channelsBalance: lndChannelsBalance(),
		channels: lndListChannels(),
		autopilotActive: lndAutopilotActive()
	};
}

export const actions = {
	activateAutopilot: async function () {
		await lndActivateAutopilot();
	}
};
