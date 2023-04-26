import { MONGODB_URL, MONGODB_DB } from '$env/static/private';
import { MongoClient, ObjectId, type WithSessionCallback } from 'mongodb';
import type { Picture } from '../types/Picture';
import type { Product } from '$lib/types/Product';
import type { RuntimeConfigItem } from './runtime-config';
import type { Lock } from '$lib/types/Lock';
import type { Cart } from '$lib/types/Cart';

const client = new MongoClient(MONGODB_URL, {
	// directConnection: true
});

export const connectPromise = client.connect().catch(console.error);

const db = client.db(MONGODB_DB);

// const users = db.collection<User>('users');
const pictures = db.collection<Picture>('pictures');
const products = db.collection<Product>('products');
const carts = db.collection<Cart>('carts');
const runtimeConfig = db.collection<RuntimeConfigItem>('runtimeConfig');
const locks = db.collection<Lock>('locks');

const errors = db.collection<unknown & { _id: ObjectId; url: string; method: string }>('errors');

export { client, db };
export const collections = { errors, pictures, products, runtimeConfig, locks, carts };

client.on('open', () => {
	pictures.createIndex({ productId: 1 });
	locks.createIndex({ updatedAt: 1 }, { expireAfterSeconds: 60 });
	carts.createIndex({ sessionId: 1 }, { unique: true });
});

export async function withTransaction(cb: WithSessionCallback) {
	await client.withSession((session) => session.withTransaction(cb));
}
