import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
import { adminPrefix } from '$lib/server/admin';

export const load = async () => {};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const parsed = z
			.object({
				slug: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				title: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				target: z.string().trim().min(1).max(100),
				subject: z.string().trim().min(1).max(100),
				content: z.string().trim().min(1).max(MAX_CONTENT_LIMIT),
				displayFromField: z.boolean({ coerce: true }).default(false),
				prefillWithSession: z.boolean({ coerce: true }).default(false)
			})
			.parse(Object.fromEntries(formData));

		if (await collections.specifications.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'Contact form with same slug already exists');
		}

		await collections.contactForms.insertOne({
			_id: parsed.slug,
			title: parsed.title,
			content: parsed.content,
			target: parsed.target,
			subject: parsed.subject,
			displayFromField: parsed.displayFromField,
			prefillWithSession: parsed.prefillWithSession,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `${adminPrefix()}/form/${parsed.slug}`);
	}
};
