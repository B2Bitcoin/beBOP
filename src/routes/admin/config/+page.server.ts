import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export async function load() {
	return {
		checkoutButtonOnProductPage: runtimeConfig.checkoutButtonOnProductPage
	};
}

export const actions = {
	default: async function ({ request, url }) {
		const formData = await request.formData();

		const result = z
			.object({
				checkoutButtonOnProductPage: z.boolean({ coerce: true })
			})
			.parse({
				checkoutButtonOnProductPage: formData.get('checkoutButtonOnProductPage')
			});

		if (runtimeConfig.checkoutButtonOnProductPage !== result.checkoutButtonOnProductPage) {
			runtimeConfig.checkoutButtonOnProductPage = result.checkoutButtonOnProductPage;
			await collections.runtimeConfig.updateOne(
				{ _id: 'checkoutButtonOnProductPage' },
				{ $set: { data: result.checkoutButtonOnProductPage, updatedAt: new Date() } },
				{ upsert: true }
			);
		}
	}
};
