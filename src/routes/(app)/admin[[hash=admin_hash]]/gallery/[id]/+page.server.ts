import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { adminPrefix } from '$lib/server/admin';
import { deletePicture } from '$lib/server/picture';

export const load = async ({ params }) => {
	const pictures = await collections.pictures
		.find({ 'tag._id': params.id })
		.sort({ createdAt: 1 })
		.toArray();

	return {
		pictures
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}
		const gallery = await collections.galleries.findOne({ _id: params.id });

		if (!gallery) {
			throw error(404, 'gallery not found');
		}
		const parsed = z
			.object({
				slug: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				name: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				principal: z.object({
					title: z.string(),
					content: z.string().trim().max(10_000),
					cta: z.object({ href: z.string().trim(), label: z.string().trim() })
				}),
				secondary: z
					.array(
						z.object({
							title: z.string(),
							content: z.string().trim().max(10_000),
							cta: z.object({ href: z.string().trim(), label: z.string().trim() })
						})
					)
					.optional()
					.default([])
			})
			.parse(json);

		await collections.galleries.updateOne(
			{
				_id: params.id
			},
			{
				$set: {
					updatedAt: new Date(),
					name: parsed.name,
					principal: parsed.principal,
					secondary: parsed.secondary?.filter(
						(secondary) => secondary.cta.label && secondary.cta.href
					)
				}
			}
		);

		throw redirect(303, `${adminPrefix()}/gallery/${params.id}`);
	},

	delete: async ({ params }) => {
		for await (const picture of collections.pictures.find({ 'tag._id': params.id })) {
			await deletePicture(picture._id);
		}
		await collections.tags.deleteOne({ _id: params.id });

		throw redirect(303, `${adminPrefix()}/tags`);
	}
};
