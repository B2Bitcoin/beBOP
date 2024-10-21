import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { z } from 'zod';

export async function load() {}

export const actions = {
	update: async function ({ request }) {
		const formData = await request.formData();

		const result = z
			.object({
				ageRestrictionEnabled: z.boolean({ coerce: true }),
				legalReason: z.string()
			})
			.parse({
				ageRestrictionEnabled: formData.get('ageRestrictionEnabled'),
				legalReason: formData.get('legalReason')
			});

		await collections.runtimeConfig.updateOne(
			{ _id: 'ageRestriction' },
			{
				$set: {
					data: { enabled: result.ageRestrictionEnabled, legalReason: result.legalReason },
					updatedAt: new Date()
				},
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);

		runtimeConfig.ageRestriction = {
			enabled: result.ageRestrictionEnabled,
			legalReason: result.legalReason
		};

		return {
			success: 'Age restriction updated.'
		};
	}
};
