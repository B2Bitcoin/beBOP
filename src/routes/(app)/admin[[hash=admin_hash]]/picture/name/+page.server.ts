import { collections } from '$lib/server/database';
import { z } from 'zod';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { MAX_NAME_LIMIT } from '$lib/types/Product.js';
export const load = async () => {
	return {
		pictures: await collections.pictures
			.find({ productId: { $exists: false }, slider: { $exists: false }, tag: { $exists: false } })
			.toArray()
	};
};
export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}

		for (const [key, value] of Object.entries(json)) {
			const { name } = z
				.object({
					name: z.string().trim().max(MAX_NAME_LIMIT).optional()
				})
				.parse(value);

			await collections.pictures.updateOne(
				{ _id: key },
				{
					$set: {
						name: name,
						updatedAt: new Date()
					}
				}
			);
		}
	}
};
