import { getBalance } from '$lib/server/bitcoin';

export function load() {
	return {
		balance: getBalance()
	};
}
