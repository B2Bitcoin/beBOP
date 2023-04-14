import { MONGODB_URL, MONGODB_DB } from '$env/static/private';
import { MongoClient, ObjectId } from 'mongodb';
import type { Picture } from '../types/Picture';
import type { Product } from '$lib/types/Product';

const client = new MongoClient(MONGODB_URL, {
	// directConnection: true
});

export const connectPromise = client.connect().catch(console.error);

const db = client.db(MONGODB_DB);

// const users = db.collection<User>('users');
const pictures = db.collection<Picture>('pictures');
const products = db.collection<Product>('product');
const errors = db.collection<unknown & { _id: ObjectId; url: string; method: string }>('errors');

export { client, db };
export const collections = { errors, pictures, products };

client.on('open', () => {
	// coll.createIndex(...)
});
