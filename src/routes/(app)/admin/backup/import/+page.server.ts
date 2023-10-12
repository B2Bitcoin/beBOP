import { fail } from '@sveltejs/kit';
import { SMTP_USER } from '$env/static/private';
import * as devalue from 'devalue';
import type { Challenge } from '$lib/types/Challenge.js';
import type { ImportTypeFilesTypes } from '$lib/types/Backup.js';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
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

const IMPORT_TYPE_MAPPINGS: { global: string[]; catalog: string[]; shopConfig: string[] } = {
	global: [
		'cmsPages',
		'products',
		'runtimeConfig',
		'bootikSubscriptions',
		'paidSubscriptions',
		'challenges'
	],
	catalog: ['products'],
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
			passedChallenges,
			importFiles,
			importTypeFiles
		} = z
			.object({
				fileToUpload: z.instanceof(File),
				importType: z.enum(['global', 'catalog', 'shopConfig']),
				importOrders: z.boolean({ coerce: true }),
				passedChallenges: z.boolean({ coerce: true }),
				importFiles: z.boolean({ coerce: true }),
				importTypeFiles: z.enum(['basic', 'checkWarn', 'checkClean']).optional()
			})
			.parse(json);

		if (!(fileToUpload as File).name || (fileToUpload as File).name === 'undefined') {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		const fileBuffer = await fileToUpload.arrayBuffer();
		const fileText = new TextDecoder().decode(fileBuffer);

		try {
			const fileJson = devalue.parse(fileText);

			let collections = Object.keys(fileJson);

			//Filter collection to import
			let allowedCollections = IMPORT_TYPE_MAPPINGS[importType];

			if (importOrders) {
				allowedCollections = [...allowedCollections, 'orders'];
			}

			if (importFiles) {
				allowedCollections = [...allowedCollections, 'digitalFiles', 'pictures'];
			}

			collections = collections.filter((collectionName) =>
				allowedCollections.includes(collectionName)
			);

			for (const collectionName of collections) {
				let collectionData = fileJson[collectionName];
				const collection = db.collection(collectionName);

				// If "passedChallenges" is false and the collection is "challenges",
				// filters the collection to have only future challenges.
				if (!passedChallenges && collectionName === 'challenges') {
					const now = new Date();
					collectionData = collectionData.filter(
						(challenge: Challenge) => new Date(challenge.endsAt) > now
					);
				}

				//check images
				if (importFiles && (collectionName === 'digitalFiles' || collectionName === 'pictures')) {
					collectionData = await handleImageImport(collectionData, importTypeFiles);
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

async function handleImageImport(
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
				await sendEmail({
					to: SMTP_USER,
					subject: 'WARNING : URLs ARE NOT ACCESSIBLE',
					html: `Warning: One or more URLs of ${JSON.stringify(file)} are not accessible.`
				});
			}
		} else if (importTypeFiles === 'checkClean') {
			if (allUrlsValid) {
				validFileData.push(file);
			} else {
				await sendEmail({
					to: SMTP_USER,
					subject: 'ERROR : URLs ARE NOT ACCESSIBLE',
					html: `Warning: One or more URLs of ${JSON.stringify(
						file
					)} are not accessible. We didn't import them.`
				});
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
