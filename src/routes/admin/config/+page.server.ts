import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { z } from 'zod';

export async function load() {
	return {
		checkoutButtonOnProductPage: runtimeConfig.checkoutButtonOnProductPage,
		discovery: runtimeConfig.discovery,
		subscriptionDuration: runtimeConfig.subscriptionDuration,
		subscriptionReminderSeconds: runtimeConfig.subscriptionReminderSeconds,
		origin: ORIGIN
	};
}

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const result = z
			.object({
				checkoutButtonOnProductPage: z.boolean({ coerce: true }),
				discovery: z.boolean({ coerce: true }),
				subscriptionDuration: z.enum(["month", "day", "hour"]),
				subscriptionReminderSeconds: z.number({coerce: true}).int().min(0).max(24 * 60 * 60 * 7)
			})
			.parse({
				checkoutButtonOnProductPage: formData.get('checkoutButtonOnProductPage'),
				discovery: formData.get('discovery'),
				subscriptionDuration: formData.get('subscriptionDuration'),
				subscriptionReminderSeconds: formData.get('subscriptionReminderSeconds')
			});

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
	}
};
