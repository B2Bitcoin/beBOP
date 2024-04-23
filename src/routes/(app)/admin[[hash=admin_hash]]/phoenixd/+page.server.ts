import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async () => {
	return {
		phoenixd: runtimeConfig.phoenixd
	};
};

export const actions = {
	async detect() {
		const res = await Promise.race([
			fetch('http://localhost:9740/getinfo').then(
				() => true,
				() => false
			),
			new Promise((resolve) => setTimeout(() => resolve(false), 2000))
		]);

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
				paymentMethodLabel: z.string().min(1),
				password: z.string().min(1)
			})
			.parse(Object.fromEntries(await event.request.formData()));

		runtimeConfig.phoenixd.paymentMethodLabel = parsed.paymentMethodLabel;
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
