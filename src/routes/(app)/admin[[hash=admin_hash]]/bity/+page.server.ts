import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { z } from 'zod';

export async function load() {
	return {
		bity: runtimeConfig.bity,
		hasIBAN: !!runtimeConfig.sellerIdentity?.bank?.iban
	};
}

export const actions = {
	save: async function ({ request }) {
		const bity = z
			.object({
				clientId: z.string().min(1)
			})
			.parse(Object.fromEntries(await request.formData()));

		await collections.runtimeConfig.updateOne(
			{
				_id: 'bity'
			},
			{
				$set: {
					data: bity,
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);

		runtimeConfig.bity = bity;
	},
	delete: async function () {
		await collections.runtimeConfig.deleteOne({
			_id: 'bity'
		});

		runtimeConfig.bity = {
			clientId: ''
		};
	}
};
