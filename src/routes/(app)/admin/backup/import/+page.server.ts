import { fail } from '@sveltejs/kit';
import { SMTP_USER } from '$env/static/private';
import * as devalue from 'devalue';
import type { Challenge } from '$lib/types/Challenge.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3_REGION, S3_KEY_ID, S3_KEY_SECRET, S3_BUCKET } from '$env/static/private';
import type { Picture } from '$lib/types/Picture';
import type { DigitalFile } from '$lib/types/DigitalFile';
import { sendEmail } from '$lib/server/email.js';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { z } from 'zod';
import { db } from '$lib/server/database.js';

export function load({ url }) {
	return {
		importType: url.searchParams.get('type')
	};
}

export type ImportTypeFilesTypes = 'basic' | 'checkWarn' | 'checkClean';

const IMPORT_TYPE_MAPPINGS = {
	global: [
		'cmsPages',
		'products',
		'runtimeConfig',
		'bootikSubscriptions',
		'paidSubscriptions',
		'challenges'
	],
	catalog: ['products', 'digitalFiles', 'pictures'],
	shopConfig: ['runtimeConfig']
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const {
			fileToUpload,
			importType,
			importOrders,
			includePastChallenges,
			importFiles,
			importTypeFiles
		} = z
			.object({
				fileToUpload: z.instanceof(File),
				importType: z.enum(['global', 'catalog', 'shopConfig']),
				importOrders: z.boolean({ coerce: true }),
				includePastChallenges: z.boolean({ coerce: true }),
				importFiles: z.boolean({ coerce: true }),
				importTypeFiles: z.enum(['basic', 'checkWarn', 'checkClean']).optional()
			})
			.parse(json);

		const fileBuffer = await fileToUpload.arrayBuffer();
		const fileText = new TextDecoder().decode(fileBuffer);

		try {
			const fileJson = devalue.parse(fileText);

			let collections = Object.keys(fileJson);

			let allowedCollections: string[] = IMPORT_TYPE_MAPPINGS[importType];

			if (importOrders) {
				allowedCollections = [...allowedCollections, 'orders'];
			}

			if (importFiles && importType !== 'catalog') {
				allowedCollections = [...allowedCollections, 'digitalFiles', 'pictures'];
			}

			collections = collections.filter((collectionName) =>
				allowedCollections.includes(collectionName)
			);

			for (const collectionName of collections) {
				let collectionData = fileJson[collectionName];
				const collection = db.collection(collectionName);

				if (!includePastChallenges && collectionName === 'challenges') {
					const now = new Date();
					collectionData = collectionData.filter(
						(challenge: Challenge) => new Date(challenge.endsAt) > now
					);
				}

				if (importFiles && collectionName === 'pictures') {
					collectionData = await handleImageImport(collectionData, importTypeFiles);
				}

				if (importFiles && collectionName === 'digitalFiles') {
					collectionData = await handleDigitalFileImport(collectionData, importTypeFiles);
				}

				//Delete all collection
				await collection.deleteMany({});

				//Recreate all collection
				if (collectionData.length > 0) {
					await collection.insertMany(collectionData);
				}
			}

			return {
				success: true
			};
		} catch (e) {
			console.error('Error parsing JSON', e);

			return fail(400, {
				error: true,
				message: 'Error parsing uploaded JSON'
			});
		}
	}
};

async function handleFilesImport<T extends Picture | DigitalFile>(
	fileData: T[],
	importTypeFiles: ImportTypeFilesTypes | undefined,
	handler: (file: T) => Promise<boolean>
) {
	const validFileData = [];
	const invalidURLs = [];

	for (const file of fileData) {
		const isSuccess = await handler(file);
		if (!isSuccess) {
			invalidURLs.push(JSON.stringify(file));
		}

		if (
			importTypeFiles === 'basic' ||
			importTypeFiles === 'checkWarn' ||
			(importTypeFiles === 'checkClean' && invalidURLs.length === 0)
		) {
			validFileData.push(file);
		}
	}

	await alertUser(importTypeFiles, invalidURLs);

	return validFileData;
}

async function handleImageImport(
	fileData: Picture[],
	importTypeFiles: ImportTypeFilesTypes | undefined
) {
	return await handleFilesImport(fileData, importTypeFiles, async (file: Picture) => {
		let allSuccess = true;
		allSuccess =
			allSuccess && (await uploadFileToS3(file.storage.original.url, file.storage.original.key));

		if (file.storage.formats) {
			for (const format of file.storage.formats) {
				allSuccess = allSuccess && (await uploadFileToS3(format.url, format.key));
			}
		}

		return allSuccess;
	});
}

async function handleDigitalFileImport(
	fileData: DigitalFile[],
	importTypeFiles: ImportTypeFilesTypes | undefined
) {
	return await handleFilesImport(fileData, importTypeFiles, (file: DigitalFile) => {
		return uploadFileToS3(file.storage.url, file.storage.key);
	});
}

async function uploadFileToS3(imageUrl: URL | RequestInfo | undefined, s3Key: string) {
	const s3Client = new S3Client({
		region: S3_REGION,
		credentials: {
			accessKeyId: S3_KEY_ID,
			secretAccessKey: S3_KEY_SECRET
		}
	});

	try {
		const response = await fetch(imageUrl ? imageUrl : '');

		if (response.status !== 200) {
			console.error(`Failed to fetch ${imageUrl}. Status code: ${response.status}`);
			return false;
		}

		const arrayBuffer = await response.arrayBuffer();
		const uint8ArrayBuffer = new Uint8Array(arrayBuffer);

		const params = {
			Bucket: S3_BUCKET,
			Key: s3Key,
			Body: uint8ArrayBuffer
		};

		await s3Client.send(new PutObjectCommand(params));

		return true;
	} catch (error) {
		console.error('Error in uploadFileToS3:', error);
		return false;
	}
}

async function alertUser(importType: string | undefined, invalidURLs: string[]) {
	console.log('alertUser => ', importType, invalidURLs);

	if (importType === 'basic' || invalidURLs.length === 0) {
		await sendEmail({
			to: SMTP_USER,
			subject: 'SUCCESS : IMPORT',
			html: `The importation of the file succeeded`
		});
		console.log('suuccessss');

		return;
	}

	if (importType === 'checkWarn' && invalidURLs.length > 0) {
		await sendEmail({
			to: SMTP_USER,
			subject: 'WARNING : URLs ARE NOT ACCESSIBLE',
			html: `Warning: One or more URLs of ${invalidURLs} are not accessible.`
		});

		console.log('warniiiiing');
		return;
	}

	if (importType === 'checkClean' && invalidURLs.length > 0) {
		await sendEmail({
			to: SMTP_USER,
			subject: 'ERROR : URLs ARE NOT ACCESSIBLE',
			html: `Warning: One or more URLs of ${invalidURLs} are not accessible. We didn't import them.`
		});

		console.log('errrooooor');
		return;
	}
}
