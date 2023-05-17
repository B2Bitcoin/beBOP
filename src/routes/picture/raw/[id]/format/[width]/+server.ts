import { error, redirect } from '@sveltejs/kit';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { RequestHandler } from './$types';
import { collections } from '$lib/server/database';
import { s3client, secureDownloadLink } from '$lib/server/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3_BUCKET } from '$env/static/private';

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

	throw redirect(
		302,
		secureDownloadLink(
			await getSignedUrl(
				s3client,
				new GetObjectCommand({
					Bucket: S3_BUCKET,
					Key: format.key
				}),
				{ expiresIn: 24 * 3600 }
			)
		)
	);
};
