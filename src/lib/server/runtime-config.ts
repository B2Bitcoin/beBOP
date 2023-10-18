import type { ChangeStream, ChangeStreamDocument } from 'mongodb';
import { collections } from './database';
import { exchangeRate } from '$lib/stores/exchangeRate';
import { SATOSHIS_PER_BTC, type Currency } from '$lib/types/Currency';
import type { DeliveryFees } from '$lib/types/DeliveryFees';
import { currencies } from '$lib/stores/currencies';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '$env/static/private';
import { createAdminUserInDb } from './user';
import { runMigrations } from './migrations';

const defaultConfig = {
	isAdminCreated: false,
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
	reserveStockInMinutes: 20,
	confirmationBlocks: 1,
	desiredPaymentTimeout: 120,
	bitcoinWallet: '',
	logoPictureId: '',
	lnurlPayMetadataJwtSigningKey: '',
	authLinkJwtSigningKey: '',
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

	vatExempted: false,
	vatExemptionReason: '',
	vatSingleCountry: false,
	vatCountry: '',

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
	},
	plausibleScriptUrl: ''
};

exchangeRate.set({
	BTC_EUR: defaultConfig.BTC_EUR,
	BTC_CHF: defaultConfig.BTC_CHF,
	BTC_USD: defaultConfig.BTC_USD,
	BTC_SAT: defaultConfig.BTC_SAT
});

currencies.set({
	main: defaultConfig.mainCurrency,
	secondary: defaultConfig.secondaryCurrency,
	priceReference: defaultConfig.priceReferenceCurrency
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

	currencies.set({
		main: runtimeConfig.mainCurrency,
		secondary: runtimeConfig.secondaryCurrency,
		priceReference: runtimeConfig.priceReferenceCurrency
	});

	if (!runtimeConfig.lnurlPayMetadataJwtSigningKey) {
		await collections.runtimeConfig.updateOne(
			{ _id: 'lnurlPayMetadataJwtSigningKey' },
			{ $set: { data: crypto.randomUUID(), updatedAt: new Date() } },
			{ upsert: true }
		);
	}

	if (!runtimeConfig.authLinkJwtSigningKey) {
		await collections.runtimeConfig.updateOne(
			{ _id: 'authLinkJwtSigningKey' },
			{ $set: { data: crypto.randomUUID(), updatedAt: new Date() } },
			{ upsert: true }
		);
	}

	if (!runtimeConfig.isAdminCreated && ADMIN_LOGIN && ADMIN_PASSWORD) {
		await createAdminUserInDb(ADMIN_LOGIN, ADMIN_PASSWORD).catch(console.error);
	}

	await runMigrations();
}

export function stop(): void {
	changeStream?.close().catch(console.error);
}

export const runtimeConfig = { ...defaultConfig };

export const refreshPromise = refresh();
