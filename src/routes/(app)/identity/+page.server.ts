import { collections } from '$lib/server/database.js';
import { COUNTRY_ALPHA2S } from '$lib/types/Country.js';
import { set } from 'lodash-es';
import type { JsonObject } from 'type-fest';
import { z } from 'zod';

export async function load({ locals }) {
	const personalInfoConnected = await collections.personalInfo.findOne(
		{
			user: locals.user
		},
		{
			sort: { _id: -1 }
		}
	);
	return {
		personalInfoConnected: {
			...personalInfoConnected,
			_id: personalInfoConnected?._id.toString()
		}
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			if (value) {
				set(json, key, value);
			}
		}

		const personalInfo = z
			.object({
				address: z.object({
					street: z.string().min(1).max(100).trim(),
					zip: z.string().min(1).max(100).trim(),
					city: z.string().min(1).max(100).trim(),
					country: z.enum([COUNTRY_ALPHA2S[0], ...COUNTRY_ALPHA2S.slice(1)]),
					state: z.string().min(1).max(100).trim().optional()
				}),
				firstName: z.string().min(1).max(100).trim(),
				lastName: z.string().min(1).max(100).trim()
			})
			.parse(json);

		await collections.personalInfo.updateOne(
			{
				user: locals.user
			},
			{
				$set: {
					address: personalInfo.address,
					firstName: personalInfo.firstName,
					lastname: personalInfo.lastName,
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);
	}
};
