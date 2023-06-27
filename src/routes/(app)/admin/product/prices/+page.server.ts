import { collections } from '$lib/server/database';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

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
			const price = z
				.string()
				.regex(/^\d+(\.\d+)?$/)
				.parse(value);
			await collections.products.updateOne(
				{ _id: key },
				{
					$set: {
						price: {
							amount: parseFloat(price),
							currency: 'BTC'
						},
						updatedAt: new Date()
					}
				}
			);
		}
	}
};
