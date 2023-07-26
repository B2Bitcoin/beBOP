import type { ChangeStream, ChangeStreamDocument } from 'mongodb';
import { collections } from './database';
import { exchangeRate } from '$lib/stores/exchangeRate';
import { SATOSHIS_PER_BTC, type Currency } from '$lib/types/Currency';
import type { DeliveryFees } from '$lib/types/DeliveryFees';

const defaultConfig = {
	BTC_EUR: 30_000,
	BTC_CHF: 30_000,
	BTC_USD: 30_000,
	BTC_SAT: SATOSHIS_PER_BTC,
	mainCurrency: 'BTC' as Currency,
	secondaryCurrency: 'EUR' as Currency | null,
	/**
	 * Prices are defined in this currency in the database
	 */
	priceReferenceCurrency: 'SAT' as Currency,
	orderNumber: 0,
	subscriptionNumber: 0,
	enableCashSales: false,
	isMaintenance: false,
	includeOrderUrlInQRCode: false,
	maintenanceIps: '',
	brandName: 'My Space',
	subscriptionDuration: 'month' as 'month' | 'day' | 'hour',
	subscriptionReminderSeconds: 24 * 60 * 60,
	confirmationBlocks: 1,
	bitcoinWallet: '',
	logoPictureId: '',
	lnurlPayMetadataJwtSigningKey: '',
	topbarLinks: [
		{ label: 'Blog', href: '/blog' },
		{ label: 'Store', href: '/store' },
		{ label: 'Admin', href: '/admin' }
	],
	navbarLinks: [
		{ label: 'Challenges', href: '/challenges' },
		{ label: 'Rewards', href: '/rewards' }
	],
	footerLinks: [
		{ label: 'Terms of Service', href: '/terms' },
		{ label: 'Privacy Policy', href: '/privacy' }
	],

	checkoutButtonOnProductPage: true,
	discovery: true,
	orderNotificationsResumeToken: null as unknown,
	deliveryFees: {
		mode: 'flatFee' as 'flatFee' | 'perItem',
		applyFlatFeeToEachItem: false,
		onlyPayHighest: false,
		deliveryFees: {
			default: {
				amount: 0,
				currency: 'EUR'
			}
		} as DeliveryFees
	}
};

exchangeRate.set({
	BTC_EUR: defaultConfig.BTC_EUR,
	BTC_CHF: defaultConfig.BTC_CHF,
	BTC_USD: defaultConfig.BTC_USD,
	BTC_SAT: defaultConfig.BTC_SAT
});

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

async function refresh(item?: ChangeStreamDocument<RuntimeConfigItem>): Promise<void> {
	if (item && !('documentKey' in item)) {
		return;
	}

	const configs = collections.runtimeConfig.find(item ? { _id: item.documentKey._id } : {});

	for await (const config of configs) {
		if (config._id in defaultConfig) {
			Object.assign(runtimeConfig, { [config._id]: config.data });
		}
	}

	exchangeRate.set({
		BTC_EUR: runtimeConfig.BTC_EUR,
		BTC_CHF: runtimeConfig.BTC_CHF,
		BTC_USD: runtimeConfig.BTC_USD,
		BTC_SAT: runtimeConfig.BTC_SAT
	});

	if (!runtimeConfig.lnurlPayMetadataJwtSigningKey) {
		await collections.runtimeConfig.updateOne(
			{ _id: 'lnurlPayMetadataJwtSigningKey' },
			{ $set: { data: crypto.randomUUID(), updatedAt: new Date() } },
			{ upsert: true }
		);
	}
}

export function stop(): void {
	changeStream?.close().catch(console.error);
}

export const runtimeConfig = { ...defaultConfig };

export const refreshPromise = refresh();
