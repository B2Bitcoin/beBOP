import { MONGODB_URL, MONGODB_DB } from '$env/static/private';
import type { User } from '$lib/types/User';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(MONGODB_URL, {
	// directConnection: true
});

export const connectPromise = client.connect().catch(console.error);

const db = client.db(MONGODB_DB);

const users = db.collection<User>('users');
const errors = db.collection<unknown & { _id: ObjectId; url: string; method: string }>('errors');

export { client, db };
export const collections = { users, errors };

client.on('open', () => {
	// coll.createIndex(...)
});
