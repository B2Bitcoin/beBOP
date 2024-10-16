import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { set } from 'lodash-es';
import type { JsonObject } from 'type-fest';
import { z } from 'zod';

export async function load() {}

export const actions = {
	update: async function ({ request }) {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			if (value) {
				set(json, key, value);
			}
		}
		const result = z
			.object({
				age: z.object({ restriction: z.boolean({ coerce: true }), legalReason: z.string() })
			})
			.parse(json);

		await collections.runtimeConfig.updateOne(
			{ _id: 'age' },
			{
				$set: { data: result.age, updatedAt: new Date() },
				$setOnInsert: { createdAt: new Date() }
			},
			{ upsert: true }
		);

		runtimeConfig.age = result.age;

		return {
			success: 'Age restriction updated.'
		};
	}
};
