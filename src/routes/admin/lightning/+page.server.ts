import {
	lndChannelsBalance,
	lndGetInfo,
	lndListChannels,
	lndWalletBalance
} from '$lib/server/lightning.js';

export async function load() {
	return {
		info: lndGetInfo(),
		walletBalance: lndWalletBalance(),
		channelsBalance: lndChannelsBalance(),
		channels: lndListChannels()
	};
}
