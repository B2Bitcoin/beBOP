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
		reserveStockInMinutes: runtimeConfig.reserveStockInMinutes,
		countryCodes: countryNameByAlpha2,
		origin: ORIGIN,
		plausibleScriptUrl: runtimeConfig.plausibleScriptUrl,
		ipCollect: runtimeConfig.ipCollect
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
				reserveStockInMinutes: z.number({ coerce: true }).int().min(0),
				actionOverwrite: z.enum(['', 'overwrite']).optional(),
				plausibleScriptUrl: z.string(),
				ipCollect: z.boolean({ coerce: true })
			})
			.parse(Object.fromEntries(formData));

		const { actionOverwrite, ...runtimeConfigUpdates } = {
			...result,
			secondaryCurrency: result.secondaryCurrency || null
		};

		for (const key of typedKeys(runtimeConfigUpdates)) {
			if (runtimeConfig[key] !== runtimeConfigUpdates[key]) {
				runtimeConfig[key] = runtimeConfigUpdates[key] as never;
				await collections.runtimeConfig.updateOne(
					{ _id: key },
					{ $set: { data: runtimeConfigUpdates[key], updatedAt: new Date() } },
					{ upsert: true }
				);
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
