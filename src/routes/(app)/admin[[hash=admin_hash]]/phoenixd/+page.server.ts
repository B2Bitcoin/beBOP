import { collections } from '$lib/server/database.js';
import {
	isPhoenixdConfigured,
	phoenixdBalance,
	phoenixdDetected,
	phoenixdInfo
} from '$lib/server/phoenixd.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async () => {
	if (!isPhoenixdConfigured()) {
		return {
			phoenixd: runtimeConfig.phoenixd
		};
	}

	try {
		const nodeInfo = await phoenixdInfo();
		const balance = await phoenixdBalance();

		return {
			phoenixd: runtimeConfig.phoenixd,
			nodeInfo,
			balance
		};
	} catch (err) {
		return {
			phoenixd: runtimeConfig.phoenixd,
			nodeInfo: null,
			balance: null
		};
	}
};

export const actions = {
	async detect() {
		const res = await phoenixdDetected();

		if (res) {
			runtimeConfig.phoenixd.enabled = true;
			await collections.runtimeConfig.updateOne(
				{ _id: 'phoenixd' },
				{
					$set: { data: runtimeConfig.phoenixd, updatedAt: new Date() },
					$setOnInsert: { createdAt: new Date() }
				},
				{ upsert: true }
			);
		} else {
			return fail(404, {
				message: 'No response when interrogating port 9740 locally, PhoenixD server not detected'
			});
		}
	},
	async update(event) {
		const parsed = z
			.object({
				password: z.string().min(1)
			})
			.parse(Object.fromEntries(await event.request.formData()));

		runtimeConfig.phoenixd.password = parsed.password;

		await collections.runtimeConfig.updateOne(
			{ _id: 'phoenixd' },
			{
				$set: { data: runtimeConfig.phoenixd, updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);
	},
	async disable() {
		runtimeConfig.phoenixd.enabled = false;
		runtimeConfig.phoenixd.password = '';
		await collections.runtimeConfig.updateOne(
			{ _id: 'phoenixd' },
			{
				$set: { data: runtimeConfig.phoenixd, updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);
	}
};
