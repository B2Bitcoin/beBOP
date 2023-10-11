import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { S3_REGION, S3_KEY_ID, S3_KEY_SECRET, S3_BUCKET } from '$env/static/private';
import type { ImportTypeFilesTypes } from '$lib/types/Backup';
import type { Picture } from '$lib/types/Picture';
import type { DigitalFile } from '$lib/types/DigitalFile';

export async function handleImageImport(
	fileData: Picture[] | DigitalFile[],
	importTypeFiles: ImportTypeFilesTypes | undefined
) {
	if (importTypeFiles === 'basic') {
		return fileData;
	}

	const validFileData = [];
	for (const file of fileData) {
		console.log('file ', file);

		let imageKey: string | null = null;
		if ('key' in file.storage) {
			imageKey = file.storage.key;
		} else if ('original' in file.storage && 'key' in file.storage.original) {
			imageKey = file.storage.original.key;
		}

		if (imageKey) {
			const isValidUrl = await checkUrl(imageKey);

			if (importTypeFiles === 'checkWarn') {
				validFileData.push(file);
				if (!isValidUrl) {
					console.warn(`Warning: ${imageKey} is not accessible.`);
				}
			} else if (importTypeFiles === 'checkClean' && isValidUrl) {
				validFileData.push(file);
			}
		}
	}
	return validFileData;
}

async function checkUrl(imageKey: string) {
	console.log('imageKey ', imageKey);

	try {
		const s3Client = new S3Client({
			region: S3_REGION,
			credentials: {
				accessKeyId: S3_KEY_ID,
				secretAccessKey: S3_KEY_SECRET
			}
		});

		const key = 'bootik.bootik/' + imageKey;

		await s3Client.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
		return true;
	} catch (error) {
		console.log('je passe la ');

		return false;
	}
}
