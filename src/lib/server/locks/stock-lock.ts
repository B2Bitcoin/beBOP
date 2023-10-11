import { collections } from '../database';
import { Lock } from '../lock';
import { processClosed } from '../process';
import { refreshAvailableStockInDb } from '../product';
import { refreshPromise } from '../runtime-config';
import { setTimeout } from 'node:timers/promises';

const lock = new Lock('stock');

async function maintainLock() {
	await refreshPromise;

	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		try {
			for await (const product of collections.products.find({ stock: { $exists: true } })) {
				await refreshAvailableStockInDb(product._id);
			}
		} catch (err) {
			console.error(err);
		}

		await setTimeout(30_000);
	}
}

maintainLock();
