import mongodb from 'mongodb';

const envVars = ['OLD_DB_NAME', 'NEW_DB_NAME', 'OLD_DB_URL', 'NEW_DB_URL'];

const { OLD_DB_NAME, NEW_DB_NAME, OLD_DB_URL, NEW_DB_URL } = process.env;

if (!OLD_DB_NAME || !NEW_DB_NAME || !OLD_DB_URL || !NEW_DB_URL) {
	console.error(
		'Missing environment variables: ' + envVars.filter((v) => !process.env[v]).join(', ')
	);
	process.exit(1);
}

const oldDb = new mongodb.MongoClient(OLD_DB_URL);
const newDb = new mongodb.MongoClient(NEW_DB_URL);

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

	console.log('Done');
}

main().then(() => process.exit(0));
