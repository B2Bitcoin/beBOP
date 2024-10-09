import { getBalance } from '$lib/server/bitcoind';

export function load() {
	return {
		balance: getBalance()
	};
}
