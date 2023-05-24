import type { ChangeStream, ChangeStreamDocument } from 'mongodb';
import { collections } from './database';

const defaultConfig = {
	BTC_EUR: 30_000,
	orderNumber: 0,

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
process.on('SIGINT', () => {
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

refresh();
