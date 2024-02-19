import { collections } from '$lib/server/database';
import { z } from 'zod';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { MAX_NAME_LIMIT } from '$lib/types/Product';

export const load = async () => {
	const products = await collections.products.find({}).toArray();

	return {
		products
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
			const { alias } = z
				.object({
					alias: z.string().trim().max(MAX_NAME_LIMIT).optional()
				})
				.parse(value);

			await collections.products.updateOne(
				{ _id: key },
				{
					$set: {
						alias: alias ? [key, alias] : [key],
						updatedAt: new Date()
					}
				}
			);
		}
	}
};
