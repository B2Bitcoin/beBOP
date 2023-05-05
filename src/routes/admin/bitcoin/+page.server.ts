import { bitcoinRpc, createWallet, listWallets } from '$lib/server/bitcoin';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export async function load() {
	const wallets = await listWallets();

	let transactions: string[] = [];

	if (wallets.length) {
		const transactionsResp = await bitcoinRpc('listtransactions', ['*', 100]);

		if (!transactionsResp.ok) {
			throw error(500, 'Could not list transactions');
		}

		transactions = z
			.object({ result: z.string().array() })
			.parse(await transactionsResp.json()).result;
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
