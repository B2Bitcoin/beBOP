import { adminPrefix } from '$lib/server/admin.js';
import { collections } from '$lib/server/database';
import { zodSlug } from '$lib/server/zod.js';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const {
			slug,
			title,
			content,
			shortDescription,
			fullScreen,
			maintenanceDisplay,
			hasSubstitutionContent,
			substitutionContent
		} = z
			.object({
				slug: zodSlug(),
				title: z.string().min(1).max(MAX_NAME_LIMIT),
				content: z.string().max(MAX_CONTENT_LIMIT),
				shortDescription: z.string().max(MAX_SHORT_DESCRIPTION_LIMIT),
				fullScreen: z.boolean({ coerce: true }),
				maintenanceDisplay: z.boolean({ coerce: true }),
				hasSubstitutionContent: z.boolean({ coerce: true }),
				substitutionContent: z.string().max(MAX_CONTENT_LIMIT)
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
			maintenanceDisplay,
			hasSubstitutionContent,
			...(hasSubstitutionContent && substitutionContent && { substitutionContent }),
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `${adminPrefix()}/cms/${slug}`);
	}
};
