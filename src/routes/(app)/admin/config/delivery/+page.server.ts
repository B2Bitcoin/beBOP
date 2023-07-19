import { runtimeConfig } from '$lib/server/runtime-config';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { z } from 'zod';
import { COUNTRY_ALPHA3S } from '$lib/types/Country.js';
import { CURRENCIES } from '$lib/types/Currency.js';
import { collections } from '$lib/server/database.js';

export function load() {
	return {
		deliveryFees: runtimeConfig.deliveryFees
	};
}

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const deliveryFees = z
			.object({
				mode: z.enum(['flatFee', 'perItem']),
				onlyPayHighest: z.boolean({ coerce: true }),
				fees: z
					.record(
						z.enum(['default', ...COUNTRY_ALPHA3S]),
						z.object({
							amount: z.number({ coerce: true }).min(0),
							currency: z.enum([CURRENCIES[0], ...CURRENCIES.slice(1)])
						})
					)
					.default({})
			})
			.parse(json);

		await collections.runtimeConfig.updateOne(
			{
				_id: 'deliveryFees'
			},
			{
				$set: {
					data: deliveryFees,
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);

		runtimeConfig.deliveryFees = deliveryFees;

		return {
			success: true
		};
	}
};
