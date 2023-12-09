import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
import { adminPrefix } from '$lib/server/admin';

export const load = async () => {};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const parsed = z
			.object({
				slug: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				title: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				content: z.string().trim().min(1).max(MAX_CONTENT_LIMIT)
			})
			.parse(Object.fromEntries(formData));

		if (await collections.specifications.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'Specification with same slug already exists');
		}

		await collections.specifications.insertOne({
			_id: parsed.slug,
			title: parsed.title,
			content: parsed.content,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `${adminPrefix()}/specification/${parsed.slug}`);
	}
};
