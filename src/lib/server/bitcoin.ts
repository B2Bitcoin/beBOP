import { BITCOIN_RPC_URL, BITCOIN_RPC_PASSWORD, BITCOIN_RPC_USER } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

type BitcoinCommand = 'listtransactions' | 'listwallets' | 'createwallet';

export function bitcoinRpc(command: BitcoinCommand, params: unknown[]) {
	const authorization = `Basic ${Buffer.from(
		`${BITCOIN_RPC_USER}:${BITCOIN_RPC_PASSWORD}`
	).toString('base64')}`;

	return fetch(BITCOIN_RPC_URL, {
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
		})
	});
}

export async function listWallets() {
	const response = await bitcoinRpc('listwallets', []);

	if (!response.ok) {
		throw error(500, 'Could not list wallets');
	}

	const json = await response.json();
	return z.object({ result: z.string().array() }).parse(json).result;
}

export async function createWallet(name: string) {
	const response = await bitcoinRpc('createwallet', [name, false, false, null, false, true]);

	if (!response.ok) {
		throw error(500, 'Could not create wallet');
	}

	const json = await response.json();
	return z.object({ result: z.object({ name: z.string() }) }).parse(json).result.name;
}
