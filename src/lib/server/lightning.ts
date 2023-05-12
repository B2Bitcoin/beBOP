import { readFileSync } from 'node:fs';
// We use undici instead of native fetch to be able to accept self-signed certificates
import { Agent, fetch } from 'undici';
import { LND_MACAROON_PATH, LND_MACAROON_VALUE, LND_REST_URL } from '$env/static/private';
import { z } from 'zod';

if (LND_MACAROON_PATH && LND_MACAROON_VALUE) {
	throw new Error('Cannot specify both LND_MACAROON_PATH and LND_MACAROON_VALUE');
}

const macaroon = LND_MACAROON_PATH
	? readFileSync(LND_MACAROON_PATH).toString('hex')
	: LND_MACAROON_VALUE;

const url = new URL(LND_REST_URL);

// For https://localhost or https://127.0.0.1, we need to disable TLS verification
const dispatcher =
	url.protocol === 'https:' &&
	(url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]')
		? new Agent({
				connect: {
					rejectUnauthorized: false
				}
		  })
		: undefined;

function lndRpc(path: string, options: { method?: string; headers?: Record<string, string> } = {}) {
	return fetch(`${LND_REST_URL}${path}`, {
		headers: {
			...options.headers,
			...(macaroon && { 'Grpc-Metadata-macaroon': macaroon })
		},
		method: options.method || 'GET',
		...(dispatcher && { dispatcher })
	});
}

export async function lndListChannels() {
	const response = await lndRpc('/v1/channels');

	const json = await response.json();
	return z
		.object({
			channels: z.array(
				z.object({
					capacity: z.number().int(),
					chan_id: z.number().int(),
					local_balance: z.number().int(),
					remote_balance: z.number().int()
				})
			)
		})
		.parse(json).channels;
}

export async function lndWalletBalance() {
	const response = await lndRpc('/v1/balance/blockchain');

	const json = await response.json();
	return z
		.object({
			total_balance: z.number({ coerce: true }).int(),
			confirmed_balance: z.number({ coerce: true }).int()
		})
		.parse(json).total_balance;
}
export async function lndGetInfo() {
	const response = await lndRpc('/v1/getinfo');

	const json = await response.json();
	return z.object({ alias: z.string(), testnet: z.boolean() }).parse(json);
}

export async function lndChannelsBalance() {
	const response = await lndRpc('/v1/balance/channels');

	const json = await response.json();
	return z.object({ balance: z.number({ coerce: true }).int() }).parse(json).balance;
}
