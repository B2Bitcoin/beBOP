import { ObjectId } from 'mongodb';
import { collections } from './database';
import { processClosed } from './process';
import { setTimeout } from 'node:timers/promises';
import { NO_LOCK } from '$env/static/private';
import { env } from '$env/dynamic/private';

const processId = new ObjectId();

export class Lock {
	id: string;
	ownsLock = false;
	instanceId = new ObjectId();

	onAcquire?: () => void;

	constructor(id: string) {
		this.id = id;
		this.instanceId = new ObjectId();

		this.maintain();
	}

	private async maintain() {
		if (NO_LOCK === 'true' || env.VITEST) {
			return;
		}
		while (!processClosed) {
			try {
				let lock = await collections.locks.findOne({
					_id: this.id
				});

				if (!lock) {
					lock = {
						_id: this.id,
						createdAt: new Date(),
						updatedAt: new Date(),
						ownerId: processId,
						instanceId: this.instanceId
					};

					await collections.locks.insertOne(lock);
					this.ownsLock = true;
					try {
						this.onAcquire?.();
					} catch {}
				} else {
					const res = await collections.locks.updateOne(
						{
							_id: this.id,
							ownerId: processId,
							instanceId: this.instanceId
						},
						{
							$set: {
								updatedAt: new Date()
							}
						}
					);
					const ownedLock = this.ownsLock;
					this.ownsLock = res.matchedCount > 0;

					if (!ownedLock && this.ownsLock) {
						try {
							this.onAcquire?.();
						} catch {}
					}
				}
			} catch {
				this.ownsLock = false;
			}

			await setTimeout(5_000);
		}

		this.ownsLock = false;
		this.onAcquire = undefined;

		collections.locks
			.deleteMany({
				ownerId: processId
			})
			.catch();
	}
}
