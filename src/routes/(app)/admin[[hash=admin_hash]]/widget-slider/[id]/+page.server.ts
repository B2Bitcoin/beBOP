import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';

export const load = async ({ params }) => {
	const widgetSlider = await collections.widgetSliders.findOne({ _id: params.id });

	if (!widgetSlider) {
		throw error(404, 'widget slider not found');
	}

	return {
		widgetSlider
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const parsed = z
			.object({
				title: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				lines: z.string().array()
			})
			.parse({
				title: formData.get('title'),
				lines: formData.getAll('lines')
			});
		await collections.widgetSliders.updateOne(
			{
				_id: params.id
			},
			{
				$set: {
					createdAt: new Date(),
					updatedAt: new Date(),
					title: parsed.title,
					lines: parsed.lines.filter((line) => line)
				}
			}
		);

		throw redirect(303, '/admin/widget-slider/' + params.id);
	},
	delete: async ({ params }) => {
		await collections.widgetSliders.deleteOne({ _id: params.id });

		throw redirect(303, '/admin/widget-slider');
	}
};
