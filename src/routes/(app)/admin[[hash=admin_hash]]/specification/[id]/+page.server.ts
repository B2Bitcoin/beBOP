import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { adminPrefix } from '$lib/server/admin';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';

export const load = async ({ params }) => {
	const specification = await collections.specifications.findOne({ _id: params.id });

	if (!specification) {
		throw error(404, 'specification not found');
	}
	return {
		specification
	};
};

export const actions = {
	update: async function ({ request, params }) {
		const specification = await collections.specifications.findOne({
			_id: params.id
		});

		if (!specification) {
			throw error(404, 'Specification not found');
		}

		const data = await request.formData();

		const parsed = z
			.object({
				title: z.string().min(1).max(MAX_NAME_LIMIT),
				content: z.string().max(MAX_CONTENT_LIMIT)
			})
			.parse(Object.fromEntries(data));

		await collections.specifications.updateOne(
			{
				_id: specification._id
			},
			{
				$set: {
					title: parsed.title,
					content: parsed.content,
					updatedAt: new Date()
				}
			}
		);
	},

	delete: async function ({ params }) {
		await collections.specifications.deleteOne({
			_id: params.id
		});

		throw redirect(303, `${adminPrefix()}/specification`);
	}
};
