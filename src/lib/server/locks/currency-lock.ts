import { collections } from '../database';
import { differenceInMinutes } from 'date-fns';
import { setTimeout } from 'node:timers/promises';
import { processClosed } from '../process';
import { Lock } from '../lock';

const lock = new Lock('currency');

async function maintainExchangeRate() {
	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		for (const currencyPair of ['BTC_EUR', 'BTC_CHF', 'BTC_USD', 'BTC_ZAR'] as const) {
			try {
				const doc = await collections.runtimeConfig.findOne({ _id: currencyPair });

				if (!doc || differenceInMinutes(new Date(), doc.updatedAt) > 10) {
					// const newRate = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur')
					const newRate = await fetch(
						`https://api.coingate.com/v2/rates/merchant/${currencyPair.replace('_', '/')}`
					).then((res) => res.json());

					if (typeof newRate === 'number' && newRate > 0 && !isNaN(newRate)) {
						await collections.runtimeConfig.updateOne(
							{
								_id: currencyPair
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
		}

		await setTimeout(5_000);
	}
}

maintainExchangeRate();
