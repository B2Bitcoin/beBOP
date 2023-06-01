import { createWallet, listWallets, listTransactions, getBalance } from '$lib/server/bitcoin';
import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';

export async function load() {
	const wallets = await listWallets();

	const getTransactionOrder: any = async (orderId: String) => {
		await collections.orders.findOne({ _id: orderId });
	};

	return {
		wallets,
		transactions: wallets.length ? listTransactions() : [],
		balance: wallets.length ? getBalance() : 0,
		getTransactionOrder
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
