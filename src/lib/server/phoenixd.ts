import { z } from 'zod';
import { runtimeConfig } from './runtime-config';

export const isPhoenixdConfigured = () =>
	runtimeConfig.phoenixd.enabled && !!runtimeConfig.phoenixd.password;

export async function phoenixdInfo(): Promise<{
	nodeId: string;
	chain: 'mainnet' | 'testnet';
	channels: string[];
	version: string;
}> {
	const res = await fetch('http://localhost:9740/getinfo', {
		headers: {
			Authorization: `Basic ${btoa(`:${runtimeConfig.phoenixd.password}`)}`
		}
	});

	return await res.json();
}

export async function phoenixdBalance(): Promise<{ balanceSat: number; feeCreditSat: number }> {
	const res = await fetch('http://localhost:9740/getbalance', {
		headers: {
			Authorization: `Basic ${btoa(`:${runtimeConfig.phoenixd.password}`)}`
		}
	});

	return await res.json();
}

export async function phoenixdDetected(): Promise<boolean> {
	return await Promise.race<boolean>([
		fetch('http://localhost:9740/getinfo').then(
			() => true,
			() => false
		),
		new Promise((resolve) => setTimeout(() => resolve(false), 2000))
	]);
}

export async function phoenixdCreateInvoice(
	satoshis: number,
	description: string,
	externalId: string
): Promise<{ paymentHash: string; paymentAddress: string }> {
	const payload = new FormData();

	payload.append('amountSat', satoshis.toString());
	payload.append('description', description);
	payload.append('externalId', externalId);

	const res = await fetch('http://localhost:9740/createinvoice', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`:${runtimeConfig.phoenixd.password}`)}`,
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json'
		},
		body: payload
	});

	const json = z
		.object({
			amountSat: z.number(),
			paymentHash: z.string(),
			serialized: z.string()
		})
		.parse(await res.json());

	return {
		paymentHash: json.paymentHash,
		paymentAddress: json.serialized
	};
}

export async function phoenixdLookupInvoice(paymentHash: string) {
	const res = await fetch(`http://localhost:9740/payments/incoming/${paymentHash}`, {
		headers: {
			Authorization: `Basic ${btoa(`:${runtimeConfig.phoenixd.password}`)}`
		}
	});

	const json = z
		.object({
			paymentHash: z.string(),
			preimage: z.string(),
			externalId: z.string().optional(),
			description: z.string().optional(),
			invoice: z.string(),
			isPaid: z.boolean(),
			receivedSat: z.number(),
			fees: z.number(),
			completedAt: z.number().nullable(), // in MS
			createdAt: z.number() // in MS
		})
		.parse(await res.json());

	return {
		address: json.invoice,
		feesSat: json.fees,
		receivedSat: json.receivedSat,
		isPaid: json.isPaid,
		createdAt: new Date(json.createdAt),
		completedAt: json.completedAt ? new Date(json.completedAt) : null,
		externalId: json.externalId,
		description: json.description
	};
}
