import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { zodSlug } from '$lib/server/zod';

export const load = async () => {};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const parsed = z
			.object({
				slug: zodSlug(),
				title: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				lines: z.string().array()
			})
			.parse({
				slug: formData.get('slug'),
				title: formData.get('title'),
				lines: formData.getAll('lines')
			});

		if (await collections.sliders.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'Widget slider with same slug already exists');
		}

		await collections.widgetSliders.insertOne({
			_id: parsed.slug,
			createdAt: new Date(),
			updatedAt: new Date(),
			title: parsed.title,
			lines: parsed.lines.filter((line) => line)
		});

		throw redirect(303, '/admin/widget-slider/' + parsed.slug);
	}
};
