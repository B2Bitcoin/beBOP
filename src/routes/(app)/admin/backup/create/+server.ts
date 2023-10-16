import { collections } from '$lib/server/database';
import { getS3DownloadLink } from '$lib/server/s3.js';
import type { DigitalFile } from '$lib/types/DigitalFile.js';
import type { Picture } from '$lib/types/Picture.js';
import * as devalue from 'devalue';

export const POST = async ({ request }) => {
	const { exportType } = JSON.parse(await request.text());

	const challenges = await collections.challenges.find().toArray();
	const cmsPages = await collections.cmsPages.find().toArray();
	const digitalFiles = await collections.digitalFiles.find().toArray();
	const orders = await collections.orders.find().toArray();
	const pictures = await collections.pictures.find().toArray();
	const products = await collections.products.find().toArray();
	const runtimeConfig = await collections.runtimeConfig.find().toArray();
	const bootikSubscriptions = await collections.bootikSubscriptions.find().toArray();
	const paidSubscriptions = await collections.paidSubscriptions.find().toArray();

	let digitalFilesWithUrl: DigitalFile[] = [];
	if (digitalFiles.length > 0) {
		digitalFilesWithUrl = await Promise.all(digitalFiles.map(getDigitalFileUrl));
	}

	let picturesWithUrl: Picture[] = [];
	if (pictures.length > 0) {
		picturesWithUrl = await Promise.all(pictures.map(getPictureUrl));
	}

	const dataToExport =
		exportType === 'product'
			? { products }
			: {
					challenges,
					cmsPages,
					digitalFiles: digitalFilesWithUrl,
					orders,
					pictures: picturesWithUrl,
					products,
					runtimeConfig,
					bootikSubscriptions,
					paidSubscriptions
			  };

	const exportedDatabase = devalue.stringify(dataToExport);

	return new Response(exportedDatabase, {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': `attachment; filename=backup.json`
		}
	});
};

const getPictureUrl = async (picture: Picture) => {
	picture.storage.original.url = await getS3DownloadLink(picture.storage.original.key, 604800);
	const resolvedFormats = await Promise.all(
		picture.storage.formats.map(async (currentFormat) => {
			currentFormat.url = await getS3DownloadLink(currentFormat.key, 604800);
			return currentFormat;
		})
	);
	picture.storage.formats = resolvedFormats;
	return picture;
};

const getDigitalFileUrl = async (digitalFile: DigitalFile) => {
	digitalFile.storage.url = await getS3DownloadLink(digitalFile.storage.key, 604800);

	return digitalFile;
};
