import { createWallet, listWallets, listTransactions, getBalance } from '$lib/server/bitcoin';
import { error } from '@sveltejs/kit';

export async function load() {
	const wallets = await listWallets();

	return {
		wallets,
		transactions: wallets.length ? listTransactions() : [],
		balance: wallets.length ? getBalance() : 0
	};
}

export const actions = {
	createWallet: async function () {
		const wallets = await listWallets();

		if (wallets.length) {
			throw error(400, 'Wallet already exists');
		}

		await createWallet('bootik');
	}
};
