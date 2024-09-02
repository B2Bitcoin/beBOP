import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import { collections } from '$lib/server/database';
import { getPublicS3DownloadLink } from '$lib/server/s3';

export const GET: RequestHandler = async ({ params }) => {
	const digitalFile = await collections.digitalFiles.findOne({
		secret: params.key
	});

	if (!digitalFile) {
		throw error(404, 'Digital file not found');
	}

	const downloadLink = getPublicS3DownloadLink(digitalFile.storage.key);

	throw redirect(302, await downloadLink);
};
