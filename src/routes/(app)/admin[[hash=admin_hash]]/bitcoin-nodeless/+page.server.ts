import {
	bip84Address,
	isBitcoinNodelessConfigured,
	isZPubValid
} from '$lib/server/bitcoin-nodeless.js';
import { collections } from '$lib/server/database.js';
import { defaultConfig, runtimeConfig } from '$lib/server/runtime-config';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export async function load() {
	const nextAddresses = isBitcoinNodelessConfigured()
		? Array.from({ length: 10 }, (_, i) => i).map((i) =>
				bip84Address(
					runtimeConfig.bitcoinNodeless.publicKey,
					runtimeConfig.bitcoinNodeless.derivationIndex + i
				)
		  )
		: [];
	return {
		bitcoinNodeless: runtimeConfig.bitcoinNodeless,
		nextAddresses
	};
}

export const actions = {
	async initialize({ request }) {
		const formData = await request.formData();

		const parsed = z
			.object({
				mempoolUrl: z.string().url(),
				derivationIndex: z.number({ coerce: true }),
				publicKey: z
					.string()
					.regex(
						/^(zpub|vpub)/,
						'Public key must start with zpub (mainnet) or vpub (testnet) in accordance with BIP84'
					)
			})
			.parse(Object.fromEntries(formData));

		if (!isZPubValid(parsed.publicKey)) {
			throw error(400, 'Invalid public key');
		}

		const data = {
			...parsed,
			derivationPath: "m/84'/0'/0'" as const,
			format: 'bip84' as const
		};

		runtimeConfig.bitcoinNodeless = data;

		await collections.runtimeConfig.updateOne(
			{ _id: 'bitcoinNodeless' },
			{
				$set: {
					data,
					updatedAt: new Date()
				}
			},
			{ upsert: true }
		);
	},
	async update({ request }) {
		const formData = await request.formData();

		const parsed = z
			.object({
				mempoolUrl: z.string().url()
			})
			.parse(Object.fromEntries(formData));

		runtimeConfig.bitcoinNodeless.mempoolUrl = parsed.mempoolUrl;

		await collections.runtimeConfig.updateOne(
			{ _id: 'bitcoinNodeless' },
			{
				$set: {
					'data.mempoolUrl': parsed.mempoolUrl,
					updatedAt: new Date()
				}
			}
		);
	},
	async delete() {
		runtimeConfig.bitcoinNodeless = defaultConfig.bitcoinNodeless;
		await collections.runtimeConfig.deleteOne({ _id: 'bitcoinNodeless' });
	}
};
