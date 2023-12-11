import type { ChangeStream, ChangeStreamDocument } from 'mongodb';
import { collections } from './database';
import { defaultExchangeRate, exchangeRate } from '$lib/stores/exchangeRate';
import type { Currency } from '$lib/types/Currency';
import type { DeliveryFees } from '$lib/types/DeliveryFees';
import { currencies } from '$lib/stores/currencies';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '$env/static/private';
import { createSuperAdminUserInDb } from './user';
import { runMigrations } from './migrations';
import type { ProductActionSettings } from '$lib/types/ProductActionSettings';
import type { ConfirmationThresholds } from '$lib/types/ConfirmationThresholds';
import { POS_ROLE_ID, SUPER_ADMIN_ROLE_ID } from '$lib/types/User';
import { building } from '$app/environment';
import type { SellerIdentity } from '$lib/types/SellerIdentity';
import { isUniqueConstraintError } from './utils/isUniqueConstraintError';
import { typedKeys } from '$lib/utils/typedKeys';

const defaultConfig = {
	adminHash: '',
	isAdminCreated: false,
	exchangeRate: defaultExchangeRate,
	mainCurrency: 'BTC' as Currency,
	secondaryCurrency: 'EUR' as Currency | null,
	/**
	 * Prices are defined in this currency in the database
	 */
	priceReferenceCurrency: 'SAT' as Currency,
	orderNumber: 0,
	subscriptionNumber: 0,
	themeChangeNumber: 0,
	enableCashSales: false,
	isMaintenance: false,
	includeOrderUrlInQRCode: false,
	maintenanceIps: '',
	brandName: 'My Space',
	subscriptionDuration: 'month' as 'month' | 'day' | 'hour',
	subscriptionReminderSeconds: 24 * 60 * 60,
	reserveStockInMinutes: 20,
	confirmationBlocksThresholds: {
		currency: 'SAT',
		thresholds: [],
		defaultBlocks: 1
	} as ConfirmationThresholds,
	desiredPaymentTimeout: 120,
	bitcoinWallet: '',
	logo: { isWide: false, pictureId: '', darkModePictureId: '' },
	lnurlPayMetadataJwtSigningKey: '',
	authLinkJwtSigningKey: '',
	ssoSecret: '',
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
	vatOutsideCountry: false,
	collectIPOnDeliverylessOrders: false,
	isBillingAddressMandatory: false,

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
		} satisfies DeliveryFees as DeliveryFees
	},
	plausibleScriptUrl: '',
	productActionSettings: {
		eShop: {
			visible: true,
			canBeAddedToBasket: true
		},
		retail: {
			visible: true,
			canBeAddedToBasket: true
		},
		googleShopping: {
			visible: true
		}
	} satisfies ProductActionSettings as ProductActionSettings,
	mainThemeId: '',
	sellerIdentity: null as SellerIdentity | null,
	sumUp: {
		apiKey: '',
		merchantCode: '',
		currency: 'EUR' as Currency
	},
	bity: {
		clientId: ''
	},
	usersDarkDefaultTheme: false,
	employeesDarkDefaultTheme: false,
	displayPoweredBy: false,
	displayCompanyInfo: false
};

exchangeRate.set(defaultConfig.exchangeRate);

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

if (!building) {
	changeStream = collections.runtimeConfig.watch().on('change', refresh);
}
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

	for (const currency of typedKeys(defaultConfig.exchangeRate)) {
		if (!(currency in runtimeConfig.exchangeRate)) {
			runtimeConfig.exchangeRate[currency] = defaultConfig.exchangeRate[currency];
		}
	}

	exchangeRate.set(runtimeConfig.exchangeRate);

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

	if (!runtimeConfig.ssoSecret) {
		await collections.runtimeConfig.updateOne(
			{ _id: 'ssoSecret' },
			{ $set: { data: crypto.randomUUID(), updatedAt: new Date() } },
			{ upsert: true }
		);
	}

	if (!runtimeConfig.isAdminCreated && ADMIN_LOGIN && ADMIN_PASSWORD) {
		await createSuperAdminUserInDb(ADMIN_LOGIN, ADMIN_PASSWORD).catch(console.error);
	}

	if ((await collections.roles.countDocuments({ _id: SUPER_ADMIN_ROLE_ID })) === 0) {
		await collections.roles
			.insertOne({
				_id: SUPER_ADMIN_ROLE_ID,
				name: 'Super Admin',
				permissions: {
					read: [],
					write: ['/admin/*'],
					forbidden: []
				},
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.catch((err) => {
				if (isUniqueConstraintError(err)) {
					return;
				}
				throw err;
			});
	}

	if ((await collections.roles.countDocuments({ _id: POS_ROLE_ID })) === 0) {
		await collections.roles
			.insertOne({
				_id: POS_ROLE_ID,
				name: 'Point of sale',
				permissions: {
					read: [],
					// Todo: maybe make it '/pos/*' for fully customizable roles, but for now simpler
					// to treat POS as a special case
					write: [],
					forbidden: []
				},
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.catch((err) => {
				if (isUniqueConstraintError(err)) {
					return;
				}
				throw err;
			});
	}

	await runMigrations();
}

export function stop(): void {
	changeStream?.close().catch(console.error);
}

export const runtimeConfig = { ...defaultConfig };

export function resetConfig() {
	if (!import.meta.env.VITEST) {
		throw new Error('resetConfig should only be used in tests');
	}
	Object.assign(runtimeConfig, defaultConfig);
}

export const refreshPromise = building ? Promise.resolve() : refresh();
