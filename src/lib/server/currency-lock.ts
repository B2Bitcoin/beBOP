import { collections } from './database';
import { differenceInMinutes } from 'date-fns';
import { setTimeout } from 'node:timers/promises';
import { processClosed, processId } from './process';

let ownsLock = false;

async function maintainLock(): Promise<void> {
	while (!processClosed) {
		try {
			let lock = await collections.locks.findOne({
				_id: 'currency'
			});

			if (!lock) {
				lock = {
					_id: 'currency',
					createdAt: new Date(),
					updatedAt: new Date(),
					ownerId: processId
				};

				await collections.locks.insertOne(lock);
				ownsLock = true;
			} else {
				const res = await collections.locks.updateOne(
					{
						_id: 'currency',
						ownerId: processId
					},
					{
						$set: {
							updatedAt: new Date()
						}
					}
				);
				ownsLock = res.matchedCount > 0;
			}
		} catch {
			ownsLock = false;
		}

		await setTimeout(5_000);
	}
}

async function maintainExchangeRate() {
	while (!closed) {
		if (!ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		try {
			const doc = await collections.runtimeConfig.findOne({ _id: 'BTC_EUR' });

			if (!doc || differenceInMinutes(new Date(), doc.updatedAt) > 10) {
				// const newRate = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur')
				const newRate = await fetch('https://api.coingate.com/v2/rates/merchant/BTC/EUR').then(
					(res) => res.json()
				);

				if (typeof newRate === 'number' && newRate > 0 && !isNaN(newRate)) {
					await collections.runtimeConfig.updateOne(
						{
							_id: 'BTC_EUR'
						},
						{
							$set: {
								updatedAt: new Date(),
								data: newRate
							},
							$setOnInsert: {
								createdAt: new Date()
							}
						},
						{
							upsert: true
						}
					);
				}
			}
		} catch (err) {
			console.error(err);
		}

		await setTimeout(5_000);
	}
}

maintainLock();
maintainExchangeRate();
