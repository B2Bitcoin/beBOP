import {
	createWallet,
	listWallets,
	type BitcoinTransaction,
	listTransactions
} from '$lib/server/bitcoin';
import { error } from '@sveltejs/kit';

export async function load() {
	const wallets = await listWallets();

	let transactions: BitcoinTransaction[] = [];

	if (wallets.length) {
		transactions = await listTransactions();
	}

	return {
		wallets,
		transactions
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
