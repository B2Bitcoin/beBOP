import {
	BITCOIN_RPC_URL,
	BITCOIN_RPC_PASSWORD,
	BITCOIN_RPC_USER,
	TOR_PROXY_URL,
	BIP84_ZPUB,
	BIP84_XPUB
} from '$env/static/private';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { runtimeConfig } from './runtime-config';
import { socksDispatcher } from 'fetch-socks';
import { filterUndef } from '$lib/utils/filterUndef';
import type { ObjectId } from 'mongodb';
// @ts-expect-error no types
import bip84 from 'bip84';
import { collections } from './database';

export const isBitcoinConfigured =
	!!BITCOIN_RPC_URL && !!BITCOIN_RPC_PASSWORD && !!BITCOIN_RPC_USER;

export const isBIP84Configured =
	isBitcoinConfigured && BIP84_XPUB && BIP84_ZPUB && isZPubValid(BIP84_ZPUB);

const dispatcher =
	isBitcoinConfigured &&
	TOR_PROXY_URL &&
	new URL(TOR_PROXY_URL).protocol === 'socks5:' &&
	new URL(BITCOIN_RPC_URL).hostname.endsWith('.onion')
		? socksDispatcher({
				type: 5,
				host: new URL(TOR_PROXY_URL).hostname,
				port: parseInt(new URL(TOR_PROXY_URL).port)
		  })
		: undefined;

export type BitcoinCommand =
	| 'listtransactions'
	| 'listwallets'
	| 'createwallet'
	| 'listreceivedbyaddress'
	| 'dumpprivkey'
	| 'listdescriptors'
	| 'importdescriptors'
	| 'getnewaddress'
	| 'getbalance'
	| 'getblockchaininfo';

export async function bitcoinRpc(command: BitcoinCommand, params: unknown[], wallet?: string) {
	let url = BITCOIN_RPC_URL;

	if (!['listwallets', 'createwallet', 'getblockhaininfo', 'setlabel'].includes(command)) {
		const wallets = await listWallets();

		if (wallet && !wallets.includes(wallet)) {
			throw error(400, `Wallet ${wallet} does not exist`);
		}

		if (wallets.length > 1) {
			const selectedWallet =
				wallet ||
				(wallets.includes(runtimeConfig.bitcoinWallet) ? runtimeConfig.bitcoinWallet : wallets[0]);
			url = `${url.endsWith('/') ? url.slice(0, -1) : url}/wallet/${selectedWallet}`;
		}
	}

	if (!isBitcoinConfigured) {
		throw error(500, 'Bitcoin RPC is not configured');
	}

	const authorization = `Basic ${Buffer.from(
		`${BITCOIN_RPC_USER}:${BITCOIN_RPC_PASSWORD}`
	).toString('base64')}`;

	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
			Authorization: authorization
		},
		body: JSON.stringify({
			jsonrpc: '1.0',
			id: crypto.randomUUID(),
			method: command,
			params
		}),
		...{ dispatcher }
	});
}

export async function listWallets() {
	const response = await bitcoinRpc('listwallets', []);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not list wallets');
	}

	const json = await response.json();
	return z.object({ result: z.string().array() }).parse(json).result;
}

export async function currentWallet() {
	const wallets = await listWallets();
	return wallets.includes(runtimeConfig.bitcoinWallet) ? runtimeConfig.bitcoinWallet : wallets[0];
}

export async function createWallet(name: string) {
	const response = await bitcoinRpc('createwallet', [name, false, false, null, false, true]);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not create wallet');
	}

	const json = await response.json();
	return z.object({ result: z.object({ name: z.string() }) }).parse(json).result.name;
}

export async function getNewAddress(label: string): Promise<string> {
	if (isBIP84Configured) {
		if (runtimeConfig.bitcoinDerivationIndex === 0 && (await listWallets()).length === 0) {
			throw error(400, 'Create a wallet first to be able to watch BIP84 addresses');
		}
		const derivationIndex = await generateDerivationIndex();

		const address = bip84Address(BIP84_ZPUB, derivationIndex);
		const response = await bitcoinRpc('importdescriptors', [
			[
				{
					desc: `wpkh(${BIP84_XPUB}/84'/0'/0'/0/${derivationIndex})`,
					timestamp: 'now',
					label,
					range: [0, 0],
					index: 0
				}
			]
		]);

		if (!response.ok) {
			console.error(await response.text());
			throw error(500, 'Could not import address');
		}
		const json = await response.json();

		if (!json[0].success) {
			console.error(json);
			throw error(500, 'Could not import address');
		}

		return address;
	}

	const response = await bitcoinRpc('getnewaddress', [label, 'bech32']);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not get new address');
	}

	const json = await response.json();
	return z.object({ result: z.string() }).parse(json).result;
}

export async function listTransactions(label?: string) {
	const response = await bitcoinRpc('listtransactions', [label || '*', 100, 0, true]);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not list transactions');
	}

	const json = await response.json();
	return z
		.object({
			result: z.array(
				z.object({
					address: z.string(),
					category: z.enum(['send', 'receive', 'generate', 'immature', 'orphan']),
					label: z.string(),
					fee: z.number().optional(),
					amount: z.number(),
					confirmations: z.number(),
					txid: z.string()
				})
			)
		})
		.parse(json).result;
}

export async function getBalance(confirmations = 1) {
	const response = await bitcoinRpc('getbalance', ['*', confirmations]);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not get balance');
	}

	const json = await response.json();
	return z.object({ result: z.number() }).parse(json).result;
}

export async function getBlockchainInfo() {
	const response = await bitcoinRpc('getblockchaininfo', []);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not get blockchain info');
	}

	const json = await response.json();
	return z.object({ result: z.object({ blocks: z.number(), chain: z.string() }) }).parse(json)
		.result;
}

export async function listDescriptors(wallet: string) {
	const response = await bitcoinRpc('listdescriptors', [true], wallet);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not list wallet descriptors');
	}

	const json = await response.json();
	return z
		.object({
			result: z.object({
				descriptors: z.array(
					z.object({
						desc: z.string(),
						timestamp: z.number(),
						active: z.boolean(),
						internal: z.boolean(),
						range: z.array(z.number()),
						next: z.number()
					})
				)
			})
		})
		.parse(json).result;
}

export async function dumpWalletInfo(wallet: string): Promise<{
	descriptors?: Array<{ desc: string }>;
	privKeys?: Array<{
		address: string;
		privKey: string;
		balance: number;
	}>;
}> {
	try {
		const descriptors = await listDescriptors(wallet);

		if (descriptors.descriptors.length > 0) {
			return descriptors;
		}
	} catch {}

	const response = await bitcoinRpc('listreceivedbyaddress', [0, false, false, '', true], wallet);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not list wallet addresses');
	}

	const json = await response.json();
	const { result: addresses } = z
		.object({
			result: z.array(z.object({ address: z.string(), amount: z.number() }))
		})
		.parse(json);

	const privKeys = filterUndef(
		await Promise.all(
			addresses.map(async ({ address, amount }) => {
				const response = await bitcoinRpc('dumpprivkey', [address], wallet);

				if (!response.ok) {
					console.error(await response.text());
					throw error(500, 'Could not dump private key for address: ' + address);
				}

				const privKey = z.object({ result: z.string() }).parse(await response.json()).result;

				return {
					address,
					privKey,
					balance: amount
				};
			})
		)
	);

	return {
		privKeys
	};
}

export type BitcoinTransaction = Awaited<ReturnType<typeof listTransactions>>[number];

export function orderAddressLabel(orderId: string, paymentId: ObjectId) {
	return `order:${orderId}:${paymentId}`;
}

export function bip84Address(zpub: string, index: number): string {
	return new bip84.fromZPub(zpub).getAddress(index);
}

export function bip84PublicKey(zpub: string, index: number): string {
	return new bip84.fromZPub(zpub).getPublicKey(index);
}

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
		{ _id: 'bitcoinDerivationIndex' },
		{ $inc: { data: 1 as never } },
		{ upsert: true, returnDocument: 'after' }
	);

	if (!res.value) {
		throw new Error('Failed to increment derivation index');
	}

	return res.value.data as number;
}
