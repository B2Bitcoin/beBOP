import { collections } from '$lib/server/database';
import { getS3DownloadLink } from '$lib/server/s3.js';
import type { DigitalFile } from '$lib/types/DigitalFile.js';
import type { Picture } from '$lib/types/Picture.js';
import * as devalue from 'devalue';

//maximum amount of time that is valid for presigned URLs
const ONE_WEEK_IN_SECONDS = 7 * 24 * 3600;

export const POST = async ({ request }) => {
	try {
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

		let digitalFilesWithUrl: (DigitalFile | undefined)[] = [];
		if (digitalFiles.length > 0) {
			digitalFilesWithUrl = await Promise.all(digitalFiles.map(addDigitalFileUrl));
		}

		let picturesWithUrl: (Picture | undefined)[] = [];
		if (pictures.length > 0) {
			picturesWithUrl = await Promise.all(pictures.map(addPictureUrls));
		}

		const dataToExport =
			exportType === 'product'
				? { products, digitalFiles: digitalFilesWithUrl, pictures: picturesWithUrl }
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
	} catch (error) {
		console.error('An error occurred during export :', error);
	}
};

const addPictureUrls = async (picture: Picture) => {
	try {
		picture.storage.original.url = await getS3DownloadLink(picture.storage.original.key, 604800);
		const resolvedFormats = await Promise.all(
			picture.storage.formats.map(async (currentFormat) => {
				currentFormat.url = await getS3DownloadLink(currentFormat.key, ONE_WEEK_IN_SECONDS);
				return currentFormat;
			})
		);
		picture.storage.formats = resolvedFormats;
		return picture;
	} catch (error) {
		console.error('An error occurred during picture URL addition :', error);
	}
};

const addDigitalFileUrl = async (digitalFile: DigitalFile) => {
	try {
		digitalFile.storage.url = await getS3DownloadLink(digitalFile.storage.key, ONE_WEEK_IN_SECONDS);

		return digitalFile;
	} catch (error) {
		console.error('An error occurred during digital file URL addition :', error);
	}
};
