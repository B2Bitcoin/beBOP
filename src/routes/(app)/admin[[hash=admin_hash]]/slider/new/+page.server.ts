import { collections } from '$lib/server/database';
import { generatePicture } from '$lib/server/picture';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { S3_BUCKET } from '$env/static/private';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { getPrivateS3DownloadLink, s3client } from '$lib/server/s3';
import { zodSlug } from '$lib/server/zod';

export const load = async () => {};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const parsed = z
			.object({
				slug: zodSlug(),
				title: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				sliderPictureId: z.string().trim().min(1).max(500)
			})
			.parse(Object.fromEntries(formData));

		if (await collections.sliders.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'Slider with same slug already exists');
		}

		const pendingPicture = await collections.pendingPictures.findOne({
			_id: parsed.sliderPictureId
		});

		if (!pendingPicture) {
			throw error(400, 'Error when uploading picture');
		}

		const resp = await fetch(await getPrivateS3DownloadLink(pendingPicture.storage.original.key));

		if (!resp.ok) {
			throw error(400, 'Error when uploading picture');
		}

		const buffer = await resp.arrayBuffer();

		await generatePicture(Buffer.from(buffer), parsed.title, {
			slider: { _id: parsed.slug },
			cb: async (session) => {
				await collections.sliders.insertOne(
					{
						_id: parsed.slug,
						createdAt: new Date(),
						updatedAt: new Date(),
						title: parsed.title
					},
					{ session }
				);

				await s3client
					.deleteObject({
						Key: pendingPicture.storage.original.key,
						Bucket: S3_BUCKET
					})
					.catch();

				await collections.pendingPictures.deleteOne({ _id: parsed.sliderPictureId }, { session });
			}
		});

		throw redirect(303, '/admin/slider/' + parsed.slug);
	}
};
