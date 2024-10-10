import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { z } from 'zod';

export async function load() {}

export const actions = {
	update: async function ({ request }) {
		const formData = await request.formData();

		const result = z
			.object({
				enableSEO: z.boolean({ coerce: true })
			})
			.parse({
				enableSEO: formData.get('enableSEO')
			});

		await collections.runtimeConfig.updateOne(
			{ _id: 'enableSEO' },
			{
				$set: { data: result.enableSEO, updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);
		runtimeConfig.enableSEO = result.enableSEO;
		return {
			success: 'SEO configuration updated.'
		};
	}
};
