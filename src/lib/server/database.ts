import { MONGODB_URL, MONGODB_DB } from '$env/static/private';
import {
	MongoClient,
	ObjectId,
	type WithSessionCallback,
	type IndexSpecification,
	type CreateIndexesOptions,
	Collection,
	MongoServerError
} from 'mongodb';
import type { Picture } from '../types/Picture';
import type { Product } from '$lib/types/Product';
import type { RuntimeConfigItem } from './runtime-config';
import type { Lock } from '$lib/types/Lock';
import type { Cart } from '$lib/types/Cart';
import type { DigitalFile } from '$lib/types/DigitalFile';
import type { Order } from '$lib/types/Order';
import type { NostRNotification } from '$lib/types/NostRNotifications';
import type { NostRReceivedMessage } from '$lib/types/NostRReceivedMessage';
import type { BootikSubscription } from '$lib/types/BootikSubscription';
import type { PaidSubscription } from '$lib/types/PaidSubscription';
import type { CMSPage } from '$lib/types/CmsPage';
import type { Challenge } from '$lib/types/Challenge';
import type { EmailNotification } from '$lib/types/EmailNotification';
import type { Role } from '$lib/types/Role';
import type { User } from '$lib/types/User';
import type { Discount } from '$lib/types/Discount';
import type { Session } from '$lib/types/Session';
import type { Migration } from '$lib/types/Migration';
import type { Tag } from '$lib/types/Tag';

const client = new MongoClient(MONGODB_URL, {
	// directConnection: true
});

export const connectPromise = client.connect().catch(console.error);

const db = client.db(MONGODB_DB);

const pictures = db.collection<Picture>('pictures');
const pendingPictures = db.collection<Picture>('pictures.pending');
const products = db.collection<Product>('products');
const bootikSubscriptions = db.collection<BootikSubscription>('subscriptions');
const paidSubscriptions = db.collection<PaidSubscription>('subscriptions.paid');
const carts = db.collection<Cart>('carts');
const runtimeConfig = db.collection<RuntimeConfigItem>('runtimeConfig');
const locks = db.collection<Lock>('locks');
const digitalFiles = db.collection<DigitalFile>('digitalFiles');
const pendingDigitalFiles = db.collection<DigitalFile>('digitalFiles.pending');
const orders = db.collection<Order>('orders');
const nostrNotifications = db.collection<NostRNotification>('notifications.nostr');
const emailNotifications = db.collection<EmailNotification>('notifications.email');
const nostrReceivedMessages = db.collection<NostRReceivedMessage>('nostr.receivedMessage');
const cmsPages = db.collection<CMSPage>('cmsPages');
const challenges = db.collection<Challenge>('challenges');
const roles = db.collection<Role>('roles');
const users = db.collection<User>('users');
const discounts = db.collection<Discount>('discounts');
const sessions = db.collection<Session>('sessions');
const migrations = db.collection<Migration>('migrations');
const tags = db.collection<Tag>('tags');

const errors = db.collection<unknown & { _id: ObjectId; url: string; method: string }>('errors');

export { client, db };
export const collections = {
	errors,
	pictures,
	products,
	runtimeConfig,
	locks,
	carts,
	digitalFiles,
	pendingDigitalFiles,
	pendingPictures,
	orders,
	emailNotifications,
	nostrNotifications,
	nostrReceivedMessages,
	bootikSubscriptions,
	paidSubscriptions,
	migrations,
	cmsPages,
	challenges,
	roles,
	users,
	discounts,
	sessions,
	tags
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const indexes: Array<[Collection<any>, IndexSpecification, CreateIndexesOptions?]> = [
	[pictures, { productId: 1 }],
	[locks, { updatedAt: 1 }, { expireAfterSeconds: 60 }],
	[carts, { 'user.**': 1 }],
	[carts, { 'items.productId': 1 }],
	[orders, { 'user.**': 1 }],
	[orders, { 'items.product._id': 1, paymentStatus: 1 }],
	[
		orders,
		{ 'notifications.paymentStatus.npub': 1, createdAt: -1 },
		{ partialFilterExpression: { 'notifications.paymentStatus.npub': { $exists: true } } }
	],
	[
		orders,
		{ 'notifications.paymentStatus.email': 1, createdAt: -1 },
		{ partialFilterExpression: { 'notifications.paymentStatus.email': { $exists: true } } }
	],
	[orders, { number: 1 }, { unique: true }],
	[digitalFiles, { productId: 1 }],
	[nostrReceivedMessages, { processedAt: 1 }],
	[nostrReceivedMessages, { createdAt: -1 }],
	[nostrNotifications, { dest: 1 }],
	[nostrNotifications, { processedAt: 1 }],
	[emailNotifications, { dest: 1 }],
	[emailNotifications, { processedAt: 1 }],
	[bootikSubscriptions, { npub: 1 }, { sparse: true }],
	[paidSubscriptions, { 'user.**': 1, productId: 1 }],
	[paidSubscriptions, { number: 1 }, { unique: true }],
	// See subscription-lock.ts, for searching for subscriptions to remind
	// todo: find which index is better
	[paidSubscriptions, { cancelledAt: 1, paidUntil: 1, 'notifications.type': 1 }],
	[paidSubscriptions, { cancelledAt: 1, 'notifications.type': 1, paidUntil: 1 }],
	[users, { login: 1 }, { unique: true }],
	[
		users,
		{ login: 1 },
		{ unique: true, collation: { locale: 'en', strength: 1 }, name: 'case-insensitive-login' }
	],
	[users, { 'recovery.email': 1 }, { sparse: true, unique: true }],
	[users, { 'recovery.npub': 1 }, { sparse: true, unique: true }],
	[sessions, { expiresAt: 1 }, { expireAfterSeconds: 0 }],
	[sessions, { sessionId: 1 }, { unique: true }],
	[discounts, { endAt: 1 }]
];

client.on('open', () => {
	for (const [collection, index, options] of indexes) {
		collection
			.createIndex(index, options)
			.catch(async (err) => {
				if (err instanceof MongoServerError && err.code === 86) {
					const indexes = await collection.indexes();

					for (const existingIndex of indexes) {
						if (JSON.stringify(existingIndex.key) === JSON.stringify(index)) {
							if (
								options?.expireAfterSeconds !== existingIndex.expireAfterSeconds ||
								options?.unique !== existingIndex.unique ||
								options?.sparse !== existingIndex.sparse ||
								JSON.stringify(options?.partialFilterExpression) !==
									JSON.stringify(existingIndex.partialFilterExpression)
							) {
								await collection.dropIndex(existingIndex.name);
								await collection.createIndex(index, options);

								console.log(
									`Recreated index ${existingIndex.name} on ${collection.collectionName}`
								);

								break;
							}
						}
					}
				}
			})
			.catch(console.error);
	}
});

export async function withTransaction(cb: WithSessionCallback) {
	await client.withSession((session) => session.withTransaction(cb));
}
