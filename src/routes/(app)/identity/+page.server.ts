import { collections } from '$lib/server/database.js';
import { userIdentifier, userQuery } from '$lib/server/user';
import { COUNTRY_ALPHA2S } from '$lib/types/Country.js';
import { set } from 'lodash-es';
import type { JsonObject } from 'type-fest';
import { z } from 'zod';

export async function load({ locals }) {
	const personalInfoConnected = await collections.personalInfo.findOne(
		userQuery(userIdentifier(locals)),
		{
			sort: { _id: -1 }
		}
	);
	return {
		personalInfoConnected: {
			firstName: personalInfoConnected?.firstName,
			lastName: personalInfoConnected?.lastName,
			address: personalInfoConnected?.address,
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
				user: userIdentifier(locals)
			},
			{
				$set: {
					address: personalInfo.address,
					firstName: personalInfo.firstName,
					lastName: personalInfo.lastName,
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);
	}
};
