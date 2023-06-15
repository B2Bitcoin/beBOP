import { collections } from '$lib/server/database.js';
import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const { slug, title, content, shortDescription } = z
			.object({
				slug: z.string().max(MAX_NAME_LIMIT).min(1),
				title: z.string().min(1).max(MAX_NAME_LIMIT),
				content: z.string().max(10_000),
				shortDescription: z.string().max(MAX_SHORT_DESCRIPTION_LIMIT)
			})
			.parse({
				slug: data.get('slug'),
				title: data.get('title'),
				content: data.get('content'),
				shortDescription: data.get('shortDescription')
			});

		if (slug === 'catalog') {
			throw error(409, 'Page with same slug already exists');
		}

		const existing = await collections.cmsPages.countDocuments({ _id: slug });

		if (existing) {
			throw error(409, 'Page with same slug already exists');
		}

		await collections.cmsPages.insertOne({
			_id: slug,
			title,
			content,
			shortDescription,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `/admin/cms/${slug}`);
	}
};
