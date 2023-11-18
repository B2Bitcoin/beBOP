import { env } from '$env/dynamic/private';
import { connectPromise, createIndexes, db } from './database';
import { refreshPromise } from './runtime-config';

export async function cleanDb() {
	if (!env.VITEST) {
		throw new Error('cleanDb is only available in test mode');
	}
	if (db.databaseName !== 'bootik-test') {
		throw new Error('cleanDb can only be used with the bootik-test database');
	}
	await connectPromise;
	await refreshPromise;
	await db.dropDatabase();
	await createIndexes();
}
