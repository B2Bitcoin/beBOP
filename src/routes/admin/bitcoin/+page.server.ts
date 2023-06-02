import { createWallet, listWallets, listTransactions, getBalance } from '$lib/server/bitcoin';
import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';

export async function load() {
	const wallets = await listWallets();

	const Orderansactions = await listTransactions();
	const orders = collections.orders
		.find({ _id: { $in: Orderansactions.map((item) => item.label.slice('order:'.length)) } })
		.toArray();

	return {
		wallets,
		transactions: wallets.length ? listTransactions() : [],
		balance: wallets.length ? getBalance() : 0,
		orders
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
