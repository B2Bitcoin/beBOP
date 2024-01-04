import { runtimeConfig } from '$lib/server/runtime-config';
import { redirect } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import DEFAULT_LOGO from '$lib/assets/bebop-light.svg';
import { getS3DownloadLink } from '$lib/server/s3';
export const GET = async ({ url }) => {
	if (runtimeConfig.logo) {
		const picture = await collections.pictures.findOne({ _id: runtimeConfig.logo.pictureId });

		if (picture) {
			if (url.searchParams.has('original')) {
				throw redirect(302, await getS3DownloadLink(picture.storage.original.key));
			}

			throw redirect(302, await getS3DownloadLink(picture.storage.formats[0].key));
		}
	}

	throw redirect(302, DEFAULT_LOGO);
};
