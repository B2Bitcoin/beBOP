import { getNewAddress } from '$lib/server/bitcoin.js';

export const actions = {
	default: async function ({}) {
		const btcAddress = await getNewAddress('bity-cashin:' + new Date().toISOString());

		return {
			btcAddress
		};
	}
};
