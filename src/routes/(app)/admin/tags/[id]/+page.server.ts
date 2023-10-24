import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';

export const load: PageServerLoad = async ({ params }) => {
	const tag = await collections.tags.findOne({ _id: params.id });

	if (!tag) {
		throw error(404, 'tag not found');
	}

	return {
		tag
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}
		const tag = await collections.tags.findOne({ _id: params.id });

		if (!tag) {
			throw error(404, 'Product not found');
		}
		const parsed = z
			.object({
				name: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				content: z.string().trim().max(10_000),
				shortContent: z.string().trim().max(1_000),
				family: z.enum(['creators', 'events', 'retailers', 'temporal']),
				widgetUseOnly: z.boolean({ coerce: true }).default(false),
				productTagging: z.boolean({ coerce: true }).default(false),
				useLightDark: z.boolean({ coerce: true }).default(false),
				title: z.string(),
				subtitle: z.string(),
				ctaLinks: z
					.array(z.object({ href: z.string().trim(), label: z.string().trim() }))
					.optional(),
				menuLinks: z
					.array(z.object({ href: z.string().trim(), label: z.string().trim() }))
					.optional(),
				cssOverride: z.string().trim().max(10_000)
			})
			.parse(json);

		await collections.tags.updateOne(
			{
				_id: params.id
			},
			{
				$set: {
					updatedAt: new Date(),
					name: parsed.name,
					title: parsed.title,
					subtitle: parsed.subtitle,
					family: parsed.family,
					content: parsed.content,
					shortContent: parsed.shortContent,
					cssOveride: parsed.cssOverride,
					widgetUseOnly: parsed.widgetUseOnly,
					productTagging: parsed.productTagging,
					useLightDark: parsed.useLightDark,
					cta: parsed.ctaLinks?.filter((ctaLink) => ctaLink.label && ctaLink.href),
					menu: parsed.menuLinks?.filter((menuLink) => menuLink.label && menuLink.href)
				}
			}
		);

		throw redirect(303, '/admin/tags/' + params.id);
	},

	// Todo: disable in production
	delete: async ({ params }) => {
		await collections.tags.deleteOne({ _id: params.id });

		throw redirect(303, '/admin/tags');
	}
};
