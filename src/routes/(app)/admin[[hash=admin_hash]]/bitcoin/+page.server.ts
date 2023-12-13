import { BIP84_ZPUB } from '$env/static/private';
import {
	createWallet,
	listWallets,
	listTransactions,
	getBalance,
	getBlockchainInfo,
	isBIP84Configured,
	bitcoinRpc,
	type BitcoinCommand
} from '$lib/server/bitcoin';
import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import type { Order } from '$lib/types/Order.js';
import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';

export async function load() {
	const wallets = await listWallets();

	const transactions = wallets.length ? await listTransactions() : [];

	const orders = collections.orders
		.find({
			_id: {
				$in: transactions
					.filter((item) => item.label.startsWith('order:'))
					.map((item) => item.label.slice('order:'.length))
			}
		})
		.project<Omit<Order, 'user'>>({ user: 0, 'payments._id': 0 });

	return {
		currentWallet: runtimeConfig.bitcoinWallet,
		wallets,
		transactions: transactions.reverse(),
		balance: wallets.length ? getBalance() : 0,
		orders: orders.toArray(),
		blockchainInfo: getBlockchainInfo(),
		bip84: isBIP84Configured,
		bip84Zpub: BIP84_ZPUB,
		bitcoinDerivationIndex: runtimeConfig.bitcoinDerivationIndex,
		dev: !!import.meta.env.DEV
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
	},
	rpc: async function ({ request }) {
		const formData = await request.formData();

		const parsed = z
			.object({ method: z.string(), params: z.string() })
			.parse(Object.fromEntries(formData));

		const resp = await bitcoinRpc(parsed.method as BitcoinCommand, JSON.parse(parsed.params));

		if (!resp.ok) {
			return fail(400, { rpcFail: (await resp.json()).error.message });
		}
		return {
			rpcSuccess: (await resp.json()).result
		};
	}
};
