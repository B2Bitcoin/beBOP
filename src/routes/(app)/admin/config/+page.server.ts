import { ORIGIN } from '$env/static/private';
import { countryNameByAlpha2 } from '$lib/server/country-codes';
import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { CURRENCIES } from '$lib/types/Currency';
import { toCurrency } from '$lib/utils/toCurrency';
import { typedKeys } from '$lib/utils/typedKeys.js';
import { z } from 'zod';

export async function load(event) {
	return {
		ip: event.getClientAddress(),
		includeOrderUrlInQRCode: runtimeConfig.includeOrderUrlInQRCode,
		enableCashSales: runtimeConfig.enableCashSales,
		isMaintenance: runtimeConfig.isMaintenance,
		maintenanceIps: runtimeConfig.maintenanceIps,
		checkoutButtonOnProductPage: runtimeConfig.checkoutButtonOnProductPage,
		discovery: runtimeConfig.discovery,
		subscriptionDuration: runtimeConfig.subscriptionDuration,
		subscriptionReminderSeconds: runtimeConfig.subscriptionReminderSeconds,
		confirmationBlocks: runtimeConfig.confirmationBlocks,
		vatExemptionReason: runtimeConfig.vatExemptionReason,
		desiredPaymentTimeout: runtimeConfig.desiredPaymentTimeout,
		createUserOnSession: runtimeConfig.createUserOnSession,
		reserveStockInMinutes: runtimeConfig.reserveStockInMinutes,
		countryCodes: countryNameByAlpha2,
		origin: ORIGIN
	};
}

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const result = z
			.object({
				isMaintenance: z.boolean({ coerce: true }),
				enableCashSales: z.boolean({ coerce: true }),
				includeOrderUrlInQRCode: z.boolean({ coerce: true }),
				maintenanceIps: z.string(),
				checkoutButtonOnProductPage: z.boolean({ coerce: true }),
				discovery: z.boolean({ coerce: true }),
				subscriptionDuration: z.enum(['month', 'day', 'hour']),
				mainCurrency: z.enum([CURRENCIES[0], ...CURRENCIES.slice(1).filter((c) => c !== 'SAT')]),
				secondaryCurrency: z
					.enum([CURRENCIES[0], ...CURRENCIES.slice(1).filter((c) => c !== 'SAT'), ''])
					.optional(),
				priceReferenceCurrency: z.enum([CURRENCIES[0], ...CURRENCIES.slice(1)]),
				vatExempted: z.boolean({ coerce: true }),
				vatExemptionReason: z.string().default(runtimeConfig.vatExemptionReason),
				vatSingleCountry: z.boolean({ coerce: true }).default(runtimeConfig.vatSingleCountry),
				vatCountry: z.string().default(runtimeConfig.vatCountry),
				subscriptionReminderSeconds: z
					.number({ coerce: true })
					.int()
					.min(0)
					.max(24 * 60 * 60 * 7),
				confirmationBlocks: z.number({ coerce: true }).int().min(0),
				desiredPaymentTimeout: z.number({ coerce: true }).int().min(0),
<<<<<<< HEAD
				createUserOnSession: z.boolean({ coerce: true }),
				actionOverwrite: z.string()
=======
				reserveStockInMinutes: z.number({ coerce: true }).int().min(0),
				actionOverwrite: z.enum(['', 'overwrite']).optional()
>>>>>>> c458ebbf1fb68b61560b71f01bd7163aa5cc268a
			})
			.parse(Object.fromEntries(formData));

		const { actionOverwrite, ...runtimeConfigUpdates } = {
			...result,
			secondaryCurrency: result.secondaryCurrency || null
		};

<<<<<<< HEAD
		if (runtimeConfig.includeOrderUrlInQRCode !== result.includeOrderUrlInQRCode) {
			runtimeConfig.includeOrderUrlInQRCode = result.includeOrderUrlInQRCode;
			await collections.runtimeConfig.updateOne(
				{ _id: 'includeOrderUrlInQRCode' },
				{ $set: { data: result.includeOrderUrlInQRCode, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.isMaintenance !== result.isMaintenance) {
			runtimeConfig.isMaintenance = result.isMaintenance;
			await collections.runtimeConfig.updateOne(
				{ _id: 'isMaintenance' },
				{ $set: { data: result.isMaintenance, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.createUserOnSession !== result.createUserOnSession) {
			runtimeConfig.createUserOnSession = result.createUserOnSession;
			await collections.runtimeConfig.updateOne(
				{ _id: 'createUserOnSession' },
				{ $set: { data: result.createUserOnSession, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.enableCashSales !== result.enableCashSales) {
			runtimeConfig.enableCashSales = result.enableCashSales;
			await collections.runtimeConfig.updateOne(
				{ _id: 'enableCashSales' },
				{ $set: { data: result.enableCashSales, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.maintenanceIps !== result.maintenanceIps) {
			runtimeConfig.maintenanceIps = result.maintenanceIps;
			await collections.runtimeConfig.updateOne(
				{ _id: 'maintenanceIps' },
				{ $set: { data: result.maintenanceIps, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.checkoutButtonOnProductPage !== result.checkoutButtonOnProductPage) {
			runtimeConfig.checkoutButtonOnProductPage = result.checkoutButtonOnProductPage;
			await collections.runtimeConfig.updateOne(
				{ _id: 'checkoutButtonOnProductPage' },
				{ $set: { data: result.checkoutButtonOnProductPage, updatedAt: new Date() } },
				{ upsert: true }
			);
		}
		if (runtimeConfig.discovery !== result.discovery) {
			runtimeConfig.discovery = result.discovery;
			await collections.runtimeConfig.updateOne(
				{ _id: 'discovery' },
				{ $set: { data: result.discovery, updatedAt: new Date() } },
				{ upsert: true }
			);
		}
		if (runtimeConfig.subscriptionDuration !== result.subscriptionDuration) {
			runtimeConfig.subscriptionDuration = result.subscriptionDuration;
			await collections.runtimeConfig.updateOne(
				{ _id: 'subscriptionDuration' },
				{ $set: { data: result.subscriptionDuration, updatedAt: new Date() } },
				{ upsert: true }
			);
		}
		if (runtimeConfig.subscriptionReminderSeconds !== result.subscriptionReminderSeconds) {
			runtimeConfig.subscriptionReminderSeconds = result.subscriptionReminderSeconds;
			await collections.runtimeConfig.updateOne(
				{ _id: 'subscriptionReminderSeconds' },
				{ $set: { data: result.subscriptionReminderSeconds, updatedAt: new Date() } },
				{ upsert: true }
			);
		}
		if (runtimeConfig.confirmationBlocks !== result.confirmationBlocks) {
			runtimeConfig.confirmationBlocks = result.confirmationBlocks;
			await collections.runtimeConfig.updateOne(
				{ _id: 'confirmationBlocks' },
				{ $set: { data: result.confirmationBlocks, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.desiredPaymentTimeout !== result.desiredPaymentTimeout) {
			runtimeConfig.desiredPaymentTimeout = result.desiredPaymentTimeout;
			await collections.runtimeConfig.updateOne(
				{ _id: 'desiredPaymentTimeout' },
				{ $set: { data: result.desiredPaymentTimeout, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.mainCurrency !== result.mainCurrency) {
			runtimeConfig.mainCurrency = result.mainCurrency;
			await collections.runtimeConfig.updateOne(
				{ _id: 'mainCurrency' },
				{ $set: { data: result.mainCurrency, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.secondaryCurrency !== secondaryCurrency) {
			runtimeConfig.secondaryCurrency = secondaryCurrency;
			await collections.runtimeConfig.updateOne(
				{ _id: 'secondaryCurrency' },
				{ $set: { data: secondaryCurrency, updatedAt: new Date() } },
				{ upsert: true }
			);
		}

		if (runtimeConfig.priceReferenceCurrency !== result.priceReferenceCurrency) {
			runtimeConfig.priceReferenceCurrency = result.priceReferenceCurrency;
			await collections.runtimeConfig.updateOne(
				{ _id: 'priceReferenceCurrency' },
				{ $set: { data: result.priceReferenceCurrency, updatedAt: new Date() } },
				{ upsert: true }
			);
			if (result.actionOverwrite === 'overwrite') {
				const products = await collections.products.find({}).toArray();
				const currency = result.priceReferenceCurrency;

				for (const product of products) {
					const priceAmount = toCurrency(currency, product.price.amount, product.price.currency);

					await collections.products.updateOne(
						{ _id: product._id },
						{
							$set: {
								price: {
									amount: priceAmount,
									currency
								},
								updatedAt: new Date()
							}
						}
					);
				}
=======
		for (const key of typedKeys(runtimeConfigUpdates)) {
			if (runtimeConfig[key] !== runtimeConfigUpdates[key]) {
				runtimeConfig[key] = runtimeConfigUpdates[key] as never;
				await collections.runtimeConfig.updateOne(
					{ _id: key },
					{ $set: { data: runtimeConfigUpdates[key], updatedAt: new Date() } },
					{ upsert: true }
				);
>>>>>>> c458ebbf1fb68b61560b71f01bd7163aa5cc268a
			}
		}

		if (actionOverwrite === 'overwrite') {
			const products = await collections.products.find({}).toArray();
			const currency = result.priceReferenceCurrency;

			for (const product of products) {
				const priceAmount = toCurrency(currency, product.price.amount, product.price.currency);

				await collections.products.updateOne(
					{ _id: product._id },
					{
						$set: {
							price: {
								amount: priceAmount,
								currency
							},
							updatedAt: new Date()
						}
					}
				);
			}
		}
	}
};
