import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { getPrivateS3DownloadLink } from '$lib/server/s3';
import { error } from '@sveltejs/kit';
import sharp from 'sharp';

let cachedFavicon: Buffer | null = null;
let cachedFaviconPictureId: string | null = null;

export const GET = async ({ params }) => {
	if (params.pictureId !== runtimeConfig.faviconPictureId) {
		throw error(403, 'Favicon not found');
	}

	if (cachedFaviconPictureId === params.pictureId && cachedFavicon) {
		return new Response(cachedFavicon, { headers: { 'Content-Type': 'image/png' } });
	}

	try {
		const favicon = runtimeConfig.faviconPictureId
			? await collections.pictures.findOne({ _id: runtimeConfig.faviconPictureId })
			: null;

		const format =
			favicon?.storage.formats.find((f) => f.width === 256) || favicon?.storage.formats.at(-1);

		if (!format) {
			throw error(500, "Error when finding picture's format");
		}

		const rawPicture = format
			? await fetch(await getPrivateS3DownloadLink(format.key)).then((r) =>
					r.ok ? r.blob() : null
			  )
			: null;

		if (!rawPicture) {
			throw error(500, "Error when fetching picture's raw data");
		}

		cachedFavicon = await sharp(await rawPicture.arrayBuffer())
			.png()
			.toBuffer();

		cachedFaviconPictureId = runtimeConfig.faviconPictureId;
	} catch (err) {
		console.error('Error getting picture for favicon:', err);
		throw error(500, 'Error getting picture for favicon');
	}

	return new Response(cachedFavicon, { headers: { 'Content-Type': 'image/png' } });
};
