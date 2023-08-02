import { collections } from '$lib/server/database.js';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage.js';
import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export async function load({ params }) {
	const cmsPage = await collections.cmsPages.findOne({
		_id: params.slug
	});

	if (!cmsPage) {
		throw error(404, 'Page not found');
	}

	return {
		cmsPage
	};
}

export const actions = {
	update: async function ({ request, params }) {
		const cmsPage = await collections.cmsPages.findOne({
			_id: params.slug
		});

		if (!cmsPage) {
			throw error(404, 'Page not found');
		}

		const data = await request.formData();

		const { title, content, shortDescription, fullScreen } = z
			.object({
				title: z.string().min(1).max(MAX_NAME_LIMIT),
				content: z.string().max(MAX_CONTENT_LIMIT),
				shortDescription: z.string().max(MAX_SHORT_DESCRIPTION_LIMIT),
				fullScreen: z.boolean({ coerce: true })
			})
			.parse(Object.fromEntries(data));

		await collections.cmsPages.updateOne(
			{
				_id: cmsPage._id
			},
			{
				$set: {
					title,
					content,
					shortDescription,
					fullScreen,
					updatedAt: new Date()
				}
			}
		);
	},

	delete: async function ({ params }) {
		await collections.cmsPages.deleteOne({
			_id: params.slug
		});

		throw redirect(303, '/admin/cms');
	}
};
