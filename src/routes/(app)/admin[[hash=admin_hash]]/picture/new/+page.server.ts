import type { Actions } from './$types';
import { generatePicture } from '$lib/server/picture';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { adminPrefix } from '$lib/server/admin';
import { collections } from '$lib/server/database';
import { getS3DownloadLink, s3client } from '$lib/server/s3';
import { S3_BUCKET } from '$env/static/private';

export const actions: Actions = {
	default: async (input) => {
		const formData = await input.request.formData();

		const fields = z
			.object({
				name: z.string(),
				productId: z.string().optional(),
				sliderId: z.string().optional(),
				pictureId: z.string().min(1).max(500)
			})
			.parse(Object.fromEntries(formData));

		const pendingPicture = await collections.pendingPictures.findOne({
			_id: fields.pictureId
		});

		if (!pendingPicture) {
			throw error(400, 'Error when uploading picture');
		}

		const resp = await fetch(await getS3DownloadLink(pendingPicture.storage.original.key));

		if (!resp.ok) {
			throw error(400, 'Error when uploading picture');
		}

		const buffer = await resp.arrayBuffer();
		await generatePicture(Buffer.from(buffer), fields.name, {
			productId: fields.productId || undefined,
			slider: fields.sliderId ? { _id: fields.sliderId } : undefined,
			cb: async (session) => {
				await s3client
					.deleteObject({
						Key: pendingPicture.storage.original.key,
						Bucket: S3_BUCKET
					})
					.catch();

				await collections.pendingPictures.deleteOne({ _id: pendingPicture._id }, { session });
			}
		});

		if (fields.productId) {
			throw redirect(303, `${adminPrefix()}/product/${fields.productId}`);
		}
		if (fields.sliderId) {
			throw redirect(303, '/admin/slider/' + fields.sliderId);
		}

		throw redirect(303, `${adminPrefix()}/picture`);
	}
};
