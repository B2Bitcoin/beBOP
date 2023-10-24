import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { set } from 'lodash-es';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import type { JsonObject } from 'type-fest';

export const load = async () => {};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}
		const parsed = z
			.object({
				slug: z.string().trim().min(1).max(MAX_NAME_LIMIT),
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
					.optional()
					.default([]),
				menuLinks: z
					.array(z.object({ href: z.string().trim(), label: z.string().trim() }))
					.optional()
					.default([]),
				cssOverride: z.string().trim().max(10_000)
			})
			.parse(json);

		if (await collections.tags.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'tag with same slug already exists');
		}

		await collections.tags.insertOne({
			_id: parsed.slug,
			createdAt: new Date(),
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
		});

		throw redirect(303, '/admin/tags/' + parsed.slug);
	}
};
