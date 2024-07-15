import { ALLOW_LND_RPC } from '$env/static/private';
import { collections } from '$lib/server/database.js';
import {
	lndActivateAutopilot,
	lndAutopilotActive,
	lndChannelsBalance,
	lndGetInfo,
	lndListChannels,
	lndRpc,
	lndWalletBalance
} from '$lib/server/lnd';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';

export async function load() {
	return {
		info: lndGetInfo(),
		walletBalance: lndWalletBalance(),
		channelsBalance: lndChannelsBalance(),
		channels: lndListChannels(),
		autopilotActive: lndAutopilotActive(),
		qrCodeDescription: runtimeConfig.lightningQrCodeDescription,
		rpc: ALLOW_LND_RPC === 'true' || ALLOW_LND_RPC === '1'
	};
}

export const actions = {
	activateAutopilot: async function () {
		await lndActivateAutopilot();
	},
	updateQrCodeDescription: async function ({ request }) {
		const formData = await request.formData();
		const parsed = z
			.object({ qrCodeDescription: z.enum(['none', 'brand', 'brandAndOrderNumber', 'orderUrl']) })
			.parse(Object.fromEntries(formData));

		if (parsed.qrCodeDescription !== runtimeConfig.lightningQrCodeDescription) {
			runtimeConfig.lightningQrCodeDescription = parsed.qrCodeDescription;
			await collections.runtimeConfig.updateOne(
				{ _id: 'lightningQrCodeDescription' },
				{
					$set: { data: parsed.qrCodeDescription, updatedAt: new Date() },
					$setOnInsert: { createdAt: new Date() }
				},
				{ upsert: true }
			);
		}
	},
	rpc: async function ({ request }) {
		if (ALLOW_LND_RPC !== 'true' && ALLOW_LND_RPC !== '1') {
			throw error(403, 'Forbidden');
		}
		const formData = await request.formData();

		const parsed = z
			.object({ url: z.string(), method: z.enum(['GET', 'POST']), params: z.string() })
			.parse(Object.fromEntries(formData));

		const resp = await lndRpc(parsed.url, {
			method: parsed.method,
			body: parsed.params
		});

		if (!resp.ok) {
			return fail(400, {
				rpcFail: ((await resp.json()) as { message: string; details: unknown }).message
			});
		}
		return {
			rpcSuccess: await resp.json()
		};
	}
};
