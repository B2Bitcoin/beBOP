import { collections } from '$lib/server/database.js';
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

		const { title, content, shortDescription } = z
			.object({
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

		const existing = await collections.cmsPages.countDocuments({ _id: cmsPage._id });

		if (existing) {
			throw error(409, 'Page with same slug already exists');
		}

		await collections.cmsPages.updateOne(
			{
				_id: cmsPage._id
			},
			{
				$set: {
					title,
					content,
					shortDescription,
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
