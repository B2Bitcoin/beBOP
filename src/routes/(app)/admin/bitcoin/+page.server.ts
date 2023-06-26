import {
	createWallet,
	listWallets,
	listTransactions,
	getBalance,
	getBlockchainInfo
} from '$lib/server/bitcoin';
import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export async function load() {
	const wallets = await listWallets();

	const transactions = wallets.length ? await listTransactions() : [];

	const orders = collections.orders.find({
		_id: {
			$in: transactions
				.filter((item) => item.label.startsWith('order:'))
				.map((item) => item.label.slice('order:'.length))
		}
	});

	return {
		currentWallet: runtimeConfig.bitcoinWallet,
		wallets,
		transactions: transactions.reverse(),
		balance: wallets.length ? getBalance() : 0,
		orders: orders.toArray(),
		blockchainInfo: getBlockchainInfo()
	};
}

export const actions = {
	createWallet: async function ({ request }) {
		const wallets = await listWallets();

		const formData = await request.formData();
		const walletName = z.string().trim().parse(formData.get('wallet'));

		if (wallets.some((wallet) => wallet === walletName)) {
			throw error(400, 'Wallet already exists');
		}

		await createWallet(walletName);
	},
	setCurrentWallet: async function ({ request }) {
		const formData = await request.formData();
		const walletName = z.string().trim().parse(formData.get('wallet'));

		if (!(await listWallets()).some((wallet) => wallet === walletName)) {
			throw error(400, 'Wallet does not exist');
		}

		runtimeConfig.bitcoinWallet = walletName;
		await collections.runtimeConfig.updateOne(
			{
				_id: 'bitcoinWallet'
			},
			{
				$set: {
					data: walletName,
					updatedAt: new Date()
				},
				$setOnInsert: {
					createdAt: new Date()
				}
			},
			{
				upsert: true
			}
		);
	}
};
