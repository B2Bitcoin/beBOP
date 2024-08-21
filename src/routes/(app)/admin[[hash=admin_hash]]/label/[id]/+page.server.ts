import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { adminPrefix } from '$lib/server/admin';
import { MAX_NAME_LIMIT } from '$lib/types/Product';

export async function load({ params }) {
	const label = await collections.labels.findOne({
		_id: params.id
	});

	if (!label) {
		throw error(404, 'Page not found');
	}

	return {
		label
	};
}
export const actions = {
	update: async function ({ request, params }) {
		const label = await collections.labels.findOne({
			_id: params.id
		});

		if (!label) {
			throw error(404, 'Label not found');
		}

		const data = await request.formData();

		const parsed = z
			.object({
				name: z.string().min(1).max(MAX_NAME_LIMIT),
				color: z.string().trim().min(1).max(100),
				icon: z.string().trim().min(1).max(100)
			})
			.parse(Object.fromEntries(data));
		await collections.labels.updateOne(
			{
				_id: label._id
			},
			{
				$set: {
					name: parsed.name,
					icon: parsed.icon,
					color: parsed.color,
					updatedAt: new Date()
				}
			}
		);
	},

	delete: async function ({ params }) {
		await collections.labels.deleteOne({
			_id: params.id
		});

		throw redirect(303, `${adminPrefix()}/label`);
	}
};
