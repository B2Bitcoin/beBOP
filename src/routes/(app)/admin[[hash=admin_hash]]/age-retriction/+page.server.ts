import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { z } from 'zod';

export async function load() {
	return {
		ageLegalReason: runtimeConfig.ageLegalReason
	};
}

export const actions = {
	update: async function ({ request }) {
		const formData = await request.formData();

		const result = z
			.object({
				ageRestriction: z.boolean({ coerce: true }),
				ageLegalReason: z.string()
			})
			.parse({
				ageRestriction: formData.get('ageRestriction'),
				ageLegalReason: formData.get('ageLegalReason')
			});

		await collections.runtimeConfig.updateOne(
			{ _id: 'ageRestriction' },
			{
				$set: { data: result.ageRestriction, updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);
		await collections.runtimeConfig.updateOne(
			{ _id: 'ageLegalReason' },
			{
				$set: { data: result.ageLegalReason, updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);
		runtimeConfig.ageRestriction = result.ageRestriction;
		runtimeConfig.ageLegalReason = result.ageLegalReason;

		return {
			success: 'Age restriction updated.'
		};
	}
};
