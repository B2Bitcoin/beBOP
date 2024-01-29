import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { set } from 'lodash-es';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import type { JsonObject } from 'type-fest';

import { adminPrefix } from '$lib/server/admin';
import { getPrivateS3DownloadLink, s3client } from '$lib/server/s3';
import { generatePicture } from '$lib/server/picture';
import { S3_BUCKET } from '$env/static/private';

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
							pictureId: z.string().trim().max(500),
							cta: z.object({ href: z.string().trim(), label: z.string().trim() })
						})
					)
					.optional()
					.default([])
			})
			.parse(json);

		await Promise.all(
			parsed.secondary.map(async (sec) => {
				if (sec.pictureId) {
					const pendingPicture = await collections.pendingPictures.findOne({
						_id: sec.pictureId
					});

					if (!pendingPicture) {
						throw error(400, 'Error when uploading picture');
					}

					const resp = await fetch(
						await getPrivateS3DownloadLink(pendingPicture.storage.original.key)
					);

					if (!resp.ok) {
						throw error(400, 'Error when uploading picture');
					}

					const buffer = await resp.arrayBuffer();
					await generatePicture(Buffer.from(buffer), sec.pictureId, {
						galleryId: parsed.slug,
						cb: async (session) => {
							await s3client
								.deleteObject({
									Key: pendingPicture.storage.original.key,
									Bucket: S3_BUCKET
								})
								.catch();

							await collections.pendingPictures.deleteOne({ _id: sec.pictureId }, { session });
						}
					});
				}
			})
		);
		if (await collections.galleries.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'gallery with same slug already exists');
		}

		await collections.galleries.insertOne({
			_id: parsed.slug,
			createdAt: new Date(),
			updatedAt: new Date(),
			name: parsed.name,
			principal: parsed.principal,
			secondary: parsed.secondary?.filter((secondary) => secondary.cta.label && secondary.cta.href)
		});
		throw redirect(303, `${adminPrefix()}/gallery/${parsed.slug}`);
	}
};
