import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { z } from 'zod';

export async function load() {}

export const actions = {
	update: async function ({ request }) {
		const formData = await request.formData();

		const result = z
			.object({
				hideFromSearchEngines: z.boolean({ coerce: true })
			})
			.parse({
				hideFromSearchEngines: formData.get('hideFromSearchEngines')
			});

		await collections.runtimeConfig.updateOne(
			{ _id: 'hideFromSearchEngines' },
			{
				$set: { data: result.hideFromSearchEngines, updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);
		runtimeConfig.hideFromSearchEngines = result.hideFromSearchEngines;
		return {
			success: 'SEO configuration updated.'
		};
	}
};
