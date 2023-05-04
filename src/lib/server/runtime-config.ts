import { ObjectId, type ChangeStream, type ChangeStreamDocument } from 'mongodb';
import { collections } from './database';
import { differenceInMinutes } from 'date-fns';
import { setTimeout } from 'node:timers/promises';

const defaultConfig = {
	BTC_EUR: 30_000,

	checkoutButtonOnProductPage: true
};

export type RuntimeConfig = typeof defaultConfig;
type ConfigKey = keyof RuntimeConfig;
export type RuntimeConfigItem = {
	[key in ConfigKey]: { _id: key; data: RuntimeConfig[key]; updatedAt: Date };
}[ConfigKey];

let changeStream: ChangeStream<RuntimeConfigItem, ChangeStreamDocument<RuntimeConfigItem>> | null =
	null;

changeStream = collections.runtimeConfig.watch().on('change', refresh);
let closed = false;
process.on('SIGINT', () => {
	closed = true;
	changeStream?.close().catch(console.error);
});

async function refresh(): Promise<void> {
	const configs = await collections.runtimeConfig.find().toArray();

	for (const config of configs) {
		if (config._id in defaultConfig) {
			Object.assign(runtimeConfig, { [config._id]: config.data });
		}
	}
}

export function stop(): void {
	changeStream?.close().catch(console.error);
}

export const runtimeConfig = { ...defaultConfig };

const processId = new ObjectId();

let ownsLock = false;

async function maintainLock(): Promise<void> {
	while (!closed) {
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
refresh();
