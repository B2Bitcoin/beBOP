import { Lock } from '../lock';
import { processClosed } from '../process';
import { setTimeout } from 'node:timers/promises';

const lock = new Lock('paid-subscriptions');

async function maintainLock() {
	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		await setTimeout(5_000);
	}
}

maintainLock();
