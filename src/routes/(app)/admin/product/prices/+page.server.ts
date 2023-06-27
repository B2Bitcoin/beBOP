import { collections } from '$lib/server/database';
import type { PageServerLoad } from './$types';
import { runtimeConfig } from '$lib/server/runtime-config';
import { z } from 'zod';
import type { JsonObject } from 'type-fest';
import { set, isEqual } from 'lodash-es';

export const load: PageServerLoad = async () => {
	const products = await collections.products.find({}).toArray();

	return {
		products
	};
};

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		for (const [key, value] of formData) {
			const res = await collections.products.updateOne(
				{ _id: key },
				{
					$set: {
						price: value
							? {
									amount: parseFloat(value),
									currency: 'BTC'
							  }
							: undefined,
						updatedAt: new Date()
					}
				}
			);
		}
	}
};
