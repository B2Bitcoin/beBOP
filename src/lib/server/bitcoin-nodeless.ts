// @ts-expect-error no types
import bip84 from 'bip84';
import { runtimeConfig } from './runtime-config';
import { collections } from './database';

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
			$setOnInsert: { data: runtimeConfig.bitcoinNodeless }
		},
		{ upsert: true, returnDocument: 'after' }
	);

	if (!res.value) {
		throw new Error('Failed to increment derivation index');
	}

	return res.value.data as number;
}
