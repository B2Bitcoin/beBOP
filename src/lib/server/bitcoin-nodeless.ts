// @ts-expect-error no types
import bip84 from 'bip84';
import { runtimeConfig } from './runtime-config';
import { collections } from './database';
import { z } from 'zod';
import { sum } from '$lib/utils/sum';

export function isBitcoinNodelessConfigured(): boolean {
	return !!runtimeConfig.bitcoinNodeless.bip84ZPub;
}

export function bip84Address(zpub: string, index: number): string {
	return new bip84.fromZPub(zpub).getAddress(index);
}

// export function bip84PublicKey(zpub: string, index: number): string {
// 	return new bip84.fromZPub(zpub).getPublicKey(index);
// }

export function isZPubValid(zpub: string): boolean {
	try {
		new bip84.fromZPub(zpub).getAddress(0);
		return true;
	} catch {
		return false;
	}
}

export async function generateDerivationIndex(): Promise<number> {
	const res = await collections.runtimeConfig.findOneAndUpdate(
		{ _id: 'bitcoinNodeless' },
		{
			$inc: { 'data.derivationIndex': 1 as never },
			$set: { updatedAt: new Date() },
			$setOnInsert: { data: runtimeConfig.bitcoinNodeless }
		},
		{ upsert: true, returnDocument: 'after' }
	);

	if (!res.value) {
		throw new Error('Failed to increment derivation index');
	}

	return res.value.data as number;
}

export async function getSatoshiReceivedNodeless(
	address: string,
	confirmations: number
): Promise<{
	satReceived: number;
	transactions: Array<{
		currency: 'SAT';
		amount: number;
		id: string;
	}>;
}> {
	const resp = await fetch(
		new URL(`/api/address/${address}/txs`, runtimeConfig.bitcoinNodeless.mempoolUrl)
	);

	if (!resp.ok) {
		throw new Error('Failed to fetch transactions for ' + address);
	}

	const res = z
		.array(
			z.object({
				txid: z.string(),
				status: z.object({
					block_height: z.number()
				}),
				vout: z.array(
					z.object({
						scriptpubkey_address: z.string(),
						value: z.number()
					})
				)
			})
		)
		.parse(await resp.json());

	const transactions = res
		.filter((tx) => tx.status.block_height <= runtimeConfig.bitcoinBlockHeight - confirmations)
		.map((tx) => ({
			currency: 'SAT' as const,
			amount: sum(
				tx.vout.filter((vout) => vout.scriptpubkey_address === address).map((vout) => vout.value)
			),
			id: tx.txid
		}));

	const total = sum(
		res
			.filter((tx) => tx.status.block_height <= runtimeConfig.bitcoinBlockHeight - confirmations)
			.flatMap((tx) =>
				tx.vout.filter((vout) => vout.scriptpubkey_address === address).map((vout) => vout.value)
			)
	);

	return {
		satReceived: total,
		transactions
	};
}
