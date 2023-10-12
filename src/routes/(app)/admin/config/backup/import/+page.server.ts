import { fail } from '@sveltejs/kit';
import { MongoClient, Db } from 'mongodb';
import { MONGODB_URL, MONGODB_DB } from '$env/static/private';
import * as devalue from 'devalue';
import type { Challenge } from '$lib/types/Challenge.js';
import type { ImportTypeFilesTypes, ImportTypeTypes } from '$lib/types/Backup.js';
import { handleImageImport } from '$lib/utils/importData.js';

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
		const formData = Object.fromEntries(await request.formData()) as {
			fileToUpload: File;
			importType: ImportTypeTypes;
			importOrders: undefined | 'on';
			passedChallenges: undefined | 'on';
			importFiles: undefined | 'on';
			importTypeFiles: ImportTypeFilesTypes | undefined;
		};

		const { importType, importOrders, passedChallenges, importFiles, importTypeFiles } = formData;

		const importOrdersBool = importOrders === 'on';
		const passedChallengesBool = passedChallenges === 'on';
		const importFilesBool = importFiles === 'on';

		const client = new MongoClient(MONGODB_URL);
		await client.connect();
		const db: Db = client.db(MONGODB_DB);

		if (
			!(formData.fileToUpload as File).name ||
			(formData.fileToUpload as File).name === 'undefined'
		) {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		const { fileToUpload } = formData as { fileToUpload: File };

		const fileBuffer = await fileToUpload.arrayBuffer();
		const fileText = new TextDecoder().decode(fileBuffer);

		try {
			const fileJson = devalue.parse(fileText);

			let collections = Object.keys(fileJson);

			//Filter collection to import
			let allowedCollections = IMPORT_TYPE_MAPPINGS[importType];

			if (importOrdersBool) {
				allowedCollections = [...allowedCollections, 'orders'];
			}

			if (importFilesBool) {
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
				if (!passedChallengesBool && collectionName === 'challenges') {
					const now = new Date();
					collectionData = collectionData.filter(
						(challenge: Challenge) => new Date(challenge.endsAt) > now
					);
				}

				//check images
				if (
					importFilesBool &&
					(collectionName === 'digitalFiles' || collectionName === 'pictures')
				) {
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
