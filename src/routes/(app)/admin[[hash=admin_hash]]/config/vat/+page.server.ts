import { collections } from '$lib/server/database.js';
import { COUNTRY_ALPHA2S, type CountryAlpha2 } from '$lib/types/Country.js';
import { set } from 'lodash-es';
import { ObjectId } from 'mongodb';
import type { JsonObject } from 'type-fest';
import { z } from 'zod';

export const actions = {
	createProfile: async function ({ request }) {
		const data = await request.formData();
		const { name } = z
			.object({
				name: z.string().min(1)
			})
			.parse({
				name: data.get('name')
			});

		await collections.vatProfiles.insertOne({
			name,
			createdAt: new Date(),
			updatedAt: new Date(),
			_id: new ObjectId(),
			rates: {}
		});
	},

	saveProfile: async function ({ request }) {
		const formData = await request.formData();
		const json: JsonObject = {};
		for (const [key, value] of formData) {
			if (value) {
				set(json, key, value);
			}
		}

		const params = z
			.object({
				profileId: z.string(),
				name: z.string().min(1),
				rates: z
					.record(
						z.enum([...COUNTRY_ALPHA2S] as [CountryAlpha2, ...CountryAlpha2[]]),
						z.number({ coerce: true }).min(0).max(100)
					)
					.default({})
			})
			.parse(json);

		await collections.vatProfiles.updateOne(
			{
				_id: new ObjectId(params.profileId)
			},
			{
				$set: {
					name: params.name,
					rates: params.rates,
					updatedAt: new Date()
				}
			}
		);
	},

	deleteProfile: async function ({ request }) {
		const formData = await request.formData();
		const params = z
			.object({
				profileId: z.string()
			})
			.parse(Object.fromEntries(formData));

		await collections.vatProfiles.deleteOne({
			_id: new ObjectId(params.profileId)
		});
	}
};
