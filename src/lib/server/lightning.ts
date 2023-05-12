import { readFileSync } from 'node:fs';
import { LND_MACAROON_PATH, LND_MACAROON_VALUE, LND_REST_URL } from '$env/static/private';
import { z } from 'zod';

if (LND_MACAROON_PATH && LND_MACAROON_VALUE) {
	throw new Error('Cannot specify both LND_MACAROON_PATH and LND_MACAROON_VALUE');
}

const macaroon = LND_MACAROON_PATH
	? readFileSync(LND_MACAROON_PATH).toString('hex')
	: LND_MACAROON_VALUE;

export async function lndListChannels() {
	const response = await fetch(`${LND_REST_URL}/v1/channels`, {
		headers: {
			...(macaroon && { 'Grpc-Metadata-macaroon': macaroon })
		}
	});

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
	const response = await fetch(`${LND_REST_URL}/v1/balance/blockchain`, {
		headers: {
			...(macaroon && { 'Grpc-Metadata-macaroon': macaroon })
		}
	});

	const json = await response.json();
	return z
		.object({
			total_balance: z.number({ coerce: true }).int(),
			confirmed_balance: z.number({ coerce: true }).int()
		})
		.parse(json).total_balance;
}
export async function lndGetInfo() {
	const response = await fetch(`${LND_REST_URL}/v1/getinfo`, {
		headers: {
			...(macaroon && { 'Grpc-Metadata-macaroon': macaroon })
		}
	});

	const json = await response.json();
	return z.object({ alias: z.string(), testnet: z.boolean() }).parse(json);
}

export async function lndChannelsBalance() {
	const response = await fetch(`${LND_REST_URL}/v1/balance/channels`, {
		headers: {
			...(macaroon && { 'Grpc-Metadata-macaroon': macaroon })
		}
	});

	const json = await response.json();
	return z.object({ balance: z.number({ coerce: true }).int() }).parse(json).balance;
}
