import {
	BITCOIN_RPC_URL,
	BITCOIN_RPC_PASSWORD,
	BITCOIN_RPC_USER,
	TOR_PROXY_URL
} from '$env/static/private';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { runtimeConfig } from './runtime-config';
import { socksDispatcher } from 'fetch-socks';

export const isBitcoinConfigured =
	!!BITCOIN_RPC_URL && !!BITCOIN_RPC_PASSWORD && !!BITCOIN_RPC_USER;

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

type BitcoinCommand =
	| 'listtransactions'
	| 'listwallets'
	| 'createwallet'
	| 'listreceivedbyaddress'
	| 'dumpprivkey'
	| 'getnewaddress'
	| 'getbalance'
	| 'getblockchaininfo';

export async function bitcoinRpc(command: BitcoinCommand, params: unknown[], wallet?: string) {
	let url = BITCOIN_RPC_URL;

	if (!['listwallets', 'createwallet', 'getblockhaininfo'].includes(command)) {
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

export async function getNewAddress(label: string) {
	const response = await bitcoinRpc('getnewaddress', [label, 'bech32']);

	if (!response.ok) {
		console.error(await response.text());
		throw error(500, 'Could not get new address');
	}

	const json = await response.json();
	return z.object({ result: z.string() }).parse(json).result;
}

export async function listTransactions(label?: string) {
	const response = await bitcoinRpc('listtransactions', [label || '*', 100]);

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

export async function dumpPrivKeys(wallet: string): Promise<
	Array<{
		address: string;
		privKey: string;
		balance: number;
	}>
> {
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

	return await Promise.all(
		addresses.map(async ({ address, amount }) => {
			const response = await bitcoinRpc('dumpprivkey', [address], wallet);

			if (!response.ok) {
				console.error(await response.text());
				throw error(500, 'Could not dump private key');
			}

			const privKey = z.object({ result: z.string() }).parse(await response.json()).result;

			return {
				address,
				privKey,
				balance: amount
			};
		})
	);
}

export type BitcoinTransaction = Awaited<ReturnType<typeof listTransactions>>[number];

export function orderAddressLabel(orderId: string) {
	return `order:${orderId}`;
}
