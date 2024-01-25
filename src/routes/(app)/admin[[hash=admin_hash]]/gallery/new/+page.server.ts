import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { set } from 'lodash-es';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import type { JsonObject } from 'type-fest';

import { adminPrefix } from '$lib/server/admin';

export const load = async () => {};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}
		const parsed = z
			.object({
				slug: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				name: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				principal: z.object({
					title: z.string(),
					content: z.string().trim().max(10_000),
					cta: z.object({ href: z.string().trim(), label: z.string().trim() })
				}),
				secondary: z
					.array(
						z.object({
							title: z.string(),
							content: z.string().trim().max(10_000),
							cta: z.object({ href: z.string().trim(), label: z.string().trim() })
						})
					)
					.optional()
					.default([])
			})
			.parse(json);

		if (await collections.galleries.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'gallery with same slug already exists');
		}

		await collections.galleries.insertOne({
			_id: parsed.slug,
			createdAt: new Date(),
			updatedAt: new Date(),
			name: parsed.name,
			principal: parsed.principal,
			secondary: parsed.secondary?.filter((secondary) => secondary.cta.label && secondary.cta.href)
		});
		throw redirect(303, `${adminPrefix()}/gallery/${parsed.slug}`);
	}
};
