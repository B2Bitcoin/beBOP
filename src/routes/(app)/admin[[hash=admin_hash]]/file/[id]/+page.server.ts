import { collections } from '$lib/server/database';
import { getPublicS3DownloadLink } from '$lib/server/s3.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const digitalFile = await collections.digitalFiles.findOne({ _id: params.id });

	if (!digitalFile) {
		throw error(404, 'Digital file not found');
	}
	const downloadLink = getPublicS3DownloadLink(digitalFile.storage.key);

	return {
		digitalFile,
		downloadLink
	};
};
