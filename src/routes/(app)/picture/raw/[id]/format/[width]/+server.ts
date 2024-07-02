import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { collections } from '$lib/server/database';
import { getPublicS3DownloadLink } from '$lib/server/s3';
import DEFAULT_PICTURE from '$lib/assets/default-product.png';

export const GET: RequestHandler = async ({ params }) => {
	const picture = await collections.pictures.findOne({
		_id: params.id,
		'storage.formats.width': +params.width
	});

	if (!picture) {
		throw error(404);
	}

	const format = picture.storage.formats.find((f) => f.width === +params.width);

	if (!format) {
		throw error(500, "Error when finding picture's format");
	}
	throw redirect(302, await getPublicS3DownloadLink(format.key));
};
