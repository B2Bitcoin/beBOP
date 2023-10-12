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
		const imageKeys: string[] = [];

		if ('key' in file.storage) {
			imageKeys.push(file.storage.key);
		} else if ('original' in file.storage && 'key' in file.storage.original) {
			imageKeys.push(file.storage.original.key);

			if (file.storage.formats) {
				for (const format of file.storage.formats) {
					imageKeys.push(format.key);
				}
			}
		}

		const validUrls = await Promise.all(imageKeys.map((key) => checkUrl(key)));

		const allUrlsValid = validUrls.every((isValid) => isValid);

		if (importTypeFiles === 'checkWarn') {
			validFileData.push(file);
			if (!allUrlsValid) {
				console.warn(`Warning: One or more URLs of ${JSON.stringify(file)} are not accessible.`);
				console.log('EMAIL CHECK AND WARN');
			}
		} else if (importTypeFiles === 'checkClean') {
			if (allUrlsValid) {
				validFileData.push(file);
			} else {
				console.log('CHECK AND CLEAN EMAIL');
			}
		}
	}
	return validFileData;
}

async function checkUrl(imageKey: string) {
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
		return false;
	}
}
