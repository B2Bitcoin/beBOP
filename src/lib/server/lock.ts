import { ObjectId } from 'mongodb';
import { collections } from './database';
import { processClosed } from './process';
import { setTimeout } from 'node:timers/promises';

const processId = new ObjectId();

export class Lock {
	id: string;
	ownsLock = false;

	constructor(id: string) {
		this.id = id;

		this.maintain();
	}

	private async maintain() {
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
						ownerId: processId
					};

					await collections.locks.insertOne(lock);
					this.ownsLock = true;
				} else {
					const res = await collections.locks.updateOne(
						{
							_id: this.id,
							ownerId: processId
						},
						{
							$set: {
								updatedAt: new Date()
							}
						}
					);
					this.ownsLock = res.matchedCount > 0;
				}
			} catch {
				this.ownsLock = false;
			}

			await setTimeout(5_000);
		}
	}
}
