import { collections } from '$lib/server/database.js';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage.js';
import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const { slug, title, content, shortDescription, fullScreen } = z
			.object({
				slug: z.string().max(MAX_NAME_LIMIT).min(1),
				title: z.string().min(1).max(MAX_NAME_LIMIT),
				content: z.string().max(MAX_CONTENT_LIMIT),
				shortDescription: z.string().max(MAX_SHORT_DESCRIPTION_LIMIT),
				fullScreen: z.boolean({ coerce: true })
			})
			.parse(Object.fromEntries(data));

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
			fullScreen,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `/admin/cms/${slug}`);
	}
};
