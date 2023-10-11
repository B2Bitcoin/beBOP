import { MONGODB_URL, MONGODB_DB } from '$env/static/private';
import { MongoClient, ObjectId, type WithSessionCallback } from 'mongodb';
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
import type { Session } from '$lib/types/session';

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
	cmsPages,
	challenges,
	roles,
	users,
	discounts,
	sessions
};

client.on('open', () => {
	pictures.createIndex({ productId: 1 }).catch(console.error);
	locks.createIndex({ updatedAt: 1 }, { expireAfterSeconds: 60 }).catch(console.error);
	carts
		.createIndex(
			{ sessionId: 1 },
			{ unique: true, partialFilterExpression: { sessionId: { $exists: true } } }
		)
		.catch(console.error);
	carts
		.createIndex(
			{ npub: 1 },
			{ unique: true, partialFilterExpression: { npub: { $exists: true } } }
		)
		.catch(console.error);
	orders.createIndex({ sessionId: 1 }).catch(console.error);
	orders.createIndex({ 'items.product._id': 1, paymentStatus: 1 });
	orders
		.createIndex(
			{ 'notifications.paymentStatus.npub': 1, createdAt: -1 },
			{ partialFilterExpression: { 'notifications.paymentStatus.npub': { $exists: true } } }
		)
		.catch(console.error);
	orders
		.createIndex(
			{ 'notifications.paymentStatus.email': 1, createdAt: -1 },
			{ partialFilterExpression: { 'notifications.paymentStatus.email': { $exists: true } } }
		)
		.catch(console.error);
	orders.createIndex({ number: 1 }, { unique: true }).catch(console.error);
	digitalFiles.createIndex({ productId: 1 }).catch(console.error);
	nostrReceivedMessages.createIndex({ createdAt: -1 }).catch(console.error);
	nostrReceivedMessages.createIndex({ processedAt: 1 }).catch(console.error);
	nostrNotifications.createIndex({ dest: 1 }).catch(console.error);
	nostrNotifications.createIndex({ processedAt: 1 }).catch(console.error);
	emailNotifications.createIndex({ dest: 1 }).catch(console.error);
	emailNotifications.createIndex({ processedAt: 1 }).catch(console.error);
	bootikSubscriptions.createIndex({ npub: 1 }, { sparse: true }).catch(console.error);
	paidSubscriptions
		.createIndex(
			{ npub: 1, productId: 1 },
			{ unique: true, partialFilterExpression: { npub: { $exists: true } } }
		)
		.catch(console.error);
	paidSubscriptions
		.createIndex(
			{ email: 1, productId: 1 },
			{ unique: true, partialFilterExpression: { email: { $exists: true } } }
		)
		.catch(console.error);
	paidSubscriptions.createIndex({ number: 1 }, { unique: true }).catch(console.error);
	// See subscription-lock.ts, for searching for subscriptions to remind
	// todo: find which index is better
	paidSubscriptions
		.createIndex({ cancelledAt: 1, paidUntil: 1, 'notifications.type': 1 })
		.catch(console.error);
	paidSubscriptions
		.createIndex({ cancelledAt: 1, 'notifications.type': 1, paidUntil: 1 })
		.catch(console.error);
	users.createIndex({ login: 1 }, { unique: true }).catch(console.error);
	// Case-insensitive index on login
	users
		.createIndex(
			{ login: 1 },
			{ unique: true, collation: { locale: 'en', strength: 1 }, name: 'case-insensitive-login' }
		)
		.catch(console.error);
	sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(console.error);
	sessions.createIndex({ sessionId: 1 }, { unique: true }).catch(console.error);
});

export async function withTransaction(cb: WithSessionCallback) {
	await client.withSession((session) => session.withTransaction(cb));
}
