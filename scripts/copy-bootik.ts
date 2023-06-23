import mongodb from 'mongodb';
import * as AWS from '@aws-sdk/client-s3';

const envVars = [
	'OLD_DB_NAME',
	'NEW_DB_NAME',
	'OLD_DB_URL',
	'NEW_DB_URL',
	'OLD_S3_BUCKET',
	'NEW_S3_BUCKET',
	'OLD_S3_REGION',
	'NEW_S3_REGION',
	'OLD_S3_KEY',
	'NEW_S3_KEY',
	'OLD_S3_SECRET',
	'NEW_S3_SECRET',
	'OLD_S3_ENDPOINT',
	'NEW_S3_ENDPOINT'
];

const {
	OLD_DB_NAME,
	NEW_DB_NAME,
	OLD_DB_URL,
	NEW_DB_URL,
	OLD_S3_BUCKET,
	NEW_S3_BUCKET,
	OLD_S3_REGION,
	NEW_S3_REGION,
	OLD_S3_KEY,
	NEW_S3_KEY,
	OLD_S3_SECRET,
	NEW_S3_SECRET,
	OLD_S3_ENDPOINT,
	NEW_S3_ENDPOINT
} = process.env;

if (
	!OLD_DB_NAME ||
	!NEW_DB_NAME ||
	!OLD_DB_URL ||
	!NEW_DB_URL ||
	!OLD_S3_BUCKET ||
	!NEW_S3_BUCKET ||
	!OLD_S3_REGION ||
	!NEW_S3_REGION ||
	!OLD_S3_KEY ||
	!NEW_S3_KEY ||
	!OLD_S3_SECRET ||
	!NEW_S3_SECRET ||
	!OLD_S3_ENDPOINT ||
	!NEW_S3_ENDPOINT
) {
	console.error(
		'Missing environment variables: ' + envVars.filter((v) => !process.env[v]).join(', ')
	);
	process.exit(1);
}

const oldDb = new mongodb.MongoClient(OLD_DB_URL);
const newDb = new mongodb.MongoClient(NEW_DB_URL);

const oldS3 = new AWS.S3({
	region: OLD_S3_REGION,
	credentials: {
		accessKeyId: OLD_S3_KEY,
		secretAccessKey: OLD_S3_SECRET
	},
	endpoint: OLD_S3_ENDPOINT
});

const newS3 = new AWS.S3({
	region: NEW_S3_REGION,
	credentials: {
		accessKeyId: NEW_S3_KEY,
		secretAccessKey: NEW_S3_SECRET
	},
	endpoint: NEW_S3_ENDPOINT
});

async function main() {
	await oldDb.connect();
	await newDb.connect();

	const oldDbInstance = oldDb.db(OLD_DB_NAME);
	const newDbInstance = newDb.db(NEW_DB_NAME);

	const collections = await oldDbInstance.listCollections().toArray();

	for (const collection of collections) {
		const collectionName = collection.name;

		console.log(`Copying ${collectionName}...`);

		const oldCollection = oldDbInstance.collection(collectionName);
		const newCollection = newDbInstance.collection(collectionName);

		const oldCollectionData = await oldCollection.find().toArray();

		if (oldCollectionData.length) {
			await newCollection.insertMany(oldCollectionData);
		}
	}

	console.log('Copying S3...');

	for await (const page of AWS.paginateListObjectsV2(
		{ client: oldS3 },
		{ Bucket: OLD_S3_BUCKET }
	)) {
		for (const object of page.Contents ?? []) {
			const objectKey = object.Key;

			console.log(`Copying ${objectKey}...`);

			const oldObject = await oldS3.send(
				new AWS.GetObjectCommand({ Bucket: OLD_S3_BUCKET, Key: objectKey })
			);
			await newS3.send(
				new AWS.PutObjectCommand({ Bucket: NEW_S3_BUCKET, Key: objectKey, Body: oldObject.Body })
			);

			console.log(`Copied ${objectKey}`);
		}
	}

	console.log('Done');
}

main().then(() => process.exit(0));
