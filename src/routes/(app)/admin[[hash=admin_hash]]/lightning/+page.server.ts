import { collections } from '$lib/server/database.js';
import {
	lndActivateAutopilot,
	lndAutopilotActive,
	lndChannelsBalance,
	lndGetInfo,
	lndListChannels,
	lndWalletBalance
} from '$lib/server/lightning';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { z } from 'zod';

export async function load() {
	return {
		info: lndGetInfo(),
		walletBalance: lndWalletBalance(),
		channelsBalance: lndChannelsBalance(),
		channels: lndListChannels(),
		autopilotActive: lndAutopilotActive(),
		qrCodeDescription: runtimeConfig.lightningQrCodeDescription
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
	}
};
