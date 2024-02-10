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
import { addTranslations, type LocalesDictionary } from '$lib/i18n';
import { trimPrefix } from '$lib/utils/trimPrefix';
import { enhancedLanguages, languages, locales, type LanguageKey } from '$lib/translations';
import { merge } from 'lodash-es';
import { typedInclude } from '$lib/utils/typedIncludes';
import type { CountryAlpha2 } from '$lib/types/Country';

const baseConfig = {
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
	lightningQrCodeDescription: 'brand' as 'orderUrl' | 'brand' | 'brandAndOrderNumber' | 'none',
	maintenanceIps: '',
	brandName: 'My beBOP',
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
	footerLogoId: '',
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
	socialNetworkIcons: [] as Array<{ name: string; svg: string; href: string }>,

	vatExempted: false,
	vatExemptionReason: '',
	vatSingleCountry: false,
	vatCountry: 'FR' satisfies CountryAlpha2 as CountryAlpha2,
	vatNullOutsideSellerCountry: false,
	collectIPOnDeliverylessOrders: false,
	isBillingAddressMandatory: false,

	checkoutButtonOnProductPage: true,
	discovery: true,
	orderNotificationsResumeToken: null as unknown,
	deliveryFees: {
		mode: 'flatFee' as 'flatFee' | 'perItem',
		applyFlatFeeToEachItem: false,
		onlyPayHighest: false,
		allowFreeForPOS: false,
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
	displayCompanyInfo: false,
	displayNewsletterCommercialProspection: false,

	websiteTitle: 'B2Bitcoin beBOP',
	websiteShortDescription: "B2Bitcoin's beBOP store",
	emailTemplates: {
		passwordReset: {
			subject: 'Password reset',
			html: `<p>This message was sent to you because you have requested to reset your password.</p>
<p>Follow <a href="{{resetLink}}">this link</a> to reset your password.</p>
<p>If you didn't ask for this password reset procedure, please ignore this message and do nothing.</p>`,
			default: true as boolean
		},
		temporarySessionRequest: {
			subject: 'Temporary session request',
			html: `<p>This message was sent to you because you have requested a temporary session link.</p>
<p>Follow <a href="{{sessionLink}}">this link</a> to create your temporary session.</p>
<p>If you didn't ask for this temporary session procedure, please ignore this message and do nothing.</p>`,
			default: true as boolean
		},
		'order.payment.expired': {
			subject: 'Order #{{orderNumber}}',
			html: `<p>Payment for order #{{orderNumber}} is expired, see <a href="{{orderLink}}">{{orderLink}}</a></p>`,
			default: true as boolean
		},
		'order.payment.canceled': {
			subject: 'Order #{{orderNumber}}',
			html: `<p>Payment for order #{{orderNumber}} is cancelled, see <a href="{{orderLink}}">{{orderLink}}</a></p>`,
			default: true as boolean
		},
		'order.payment.pending.card': {
			subject: 'Order #{{orderNumber}}',
			html: `<p>Payment for order #{{orderNumber}} is pending, see <a href="{{orderLink}}">{{orderLink}}</a></p>
<p>Please pay using this link: <a href="{{paymentLink}}">{{paymentLink}}</a></p>`,
			default: true as boolean
		},
		'order.payment.pending.bank-transfer': {
			subject: 'Order #{{orderNumber}}',
			html: `<p>Payment for order #{{orderNumber}} is pending, see <a href="{{orderLink}}">{{orderLink}}</a></p>
<p>Please pay using this information:</p>
<p>IBAN: {{iban}}<br/>
BIC: {{bic}}<br/>
Amount: {{amount}} {{currency}}</p>`,
			default: true as boolean
		},
		'order.payment.pending.lightning': {
			subject: 'Order #{{orderNumber}}',
			html: `<p>Payment for order #{{orderNumber}} is pending, see <a href="{{orderLink}}">{{orderLink}}</a></p>
<p>Please pay using this information:</p>
<p>Lightning invoice: {{paymentAddress}}</p>`,
			default: true as boolean
		},
		'order.payment.pending.bitcoin': {
			subject: 'Order #{{orderNumber}}',
			html: `<p>Payment for order #{{orderNumber}} is pending, see <a href="{{orderLink}}">{{orderLink}}</a></p>
<p>Please send {{amount}} {{currency}} to {{paymentAddress}}</p>`,
			default: true as boolean
		},
		'order.paid': {
			subject: 'Order #{{orderNumber}}',
			html: `<p>Payment for order #{{orderNumber}} is paid, see <a href="{{orderLink}}">{{orderLink}}</a></p>
<p>Order <a href="{{orderLink}}">#{{orderNumber}}</a> is fully paid!</p>`,
			default: true as boolean
		},
		'order.payment.paid': {
			subject: 'Order #{{orderNumber}}',
			html: `<p>Payment for order #{{orderNumber}} is paid, see <a href="{{orderLink}}">{{orderLink}}</a></p>
<p>Order <a href="{{orderLink}}">#{{orderNumber}}</a> is not fully paid yet.</p>`,
			default: true as boolean
		}
	}
};

export const defaultConfig = Object.freeze(baseConfig);

export type EmailTemplateKey = keyof typeof defaultConfig.emailTemplates;

export const runtimeConfigUpdatedAt: Partial<Record<ConfigKey, Date>> = {};

exchangeRate.set(defaultConfig.exchangeRate);

currencies.set({
	main: defaultConfig.mainCurrency,
	secondary: defaultConfig.secondaryCurrency,
	priceReference: defaultConfig.priceReferenceCurrency
});

type BaseConfig = typeof baseConfig;

export type RuntimeConfig = BaseConfig &
	Partial<Record<`translations.${LanguageKey}`, LocalesDictionary>> &
	Partial<
		Record<
			`translations.${LanguageKey}.config`,
			Partial<
				Pick<
					BaseConfig,
					| 'brandName'
					| 'topbarLinks'
					| 'navbarLinks'
					| 'footerLinks'
					| 'websiteTitle'
					| 'websiteShortDescription'
				>
			>
		>
	>;
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
		if (config._id in defaultConfig || config._id.startsWith('translations.')) {
			Object.assign(runtimeConfig, { [config._id]: config.data });
			runtimeConfigUpdatedAt[config._id] = config.updatedAt;

			if (config._id.startsWith('translations.')) {
				const locale = trimPrefix(config._id, 'translations.');
				if (typedInclude(locales, locale)) {
					enhancedLanguages[locale] = merge({}, languages[locale], config.data);
					addTranslations(locale, enhancedLanguages[locale]);
				}
			}
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
}

export function stop(): void {
	changeStream?.close().catch(console.error);
}

export const runtimeConfig = structuredClone(baseConfig) as RuntimeConfig;

export function resetConfig() {
	if (!import.meta.env.VITEST) {
		throw new Error('resetConfig should only be used in tests');
	}
	Object.assign(runtimeConfig, defaultConfig);
}

export const refreshPromise = building ? Promise.resolve() : refresh().then(() => runMigrations());
