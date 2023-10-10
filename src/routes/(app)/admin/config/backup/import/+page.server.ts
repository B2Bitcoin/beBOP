import { fail } from '@sveltejs/kit';
import { MongoClient, Db } from 'mongodb';
import { MONGODB_URL, MONGODB_DB } from '$env/static/private';

export const actions = {
	default: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

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
			const fileJson = JSON.parse(fileText);

			const collections = Object.keys(fileJson);

			for (const collectionName of collections) {
				const collectionData = fileJson[collectionName];
				const collection = db.collection(collectionName);

				//Delete all collection
				await collection.deleteMany({});

				//Import collection
				await collection.insertMany(collectionData);
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
