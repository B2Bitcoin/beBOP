import type { LocalesDictionary } from '$lib/i18n.js';
import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { locales, type LanguageKey } from '$lib/translations';
import { typedEntries } from '$lib/utils/typedEntries.js';
import { typedFromEntries } from '$lib/utils/typedFromEntries.js';
import { z } from 'zod';

export async function load() {
	return {
		customTranslationKeys: locales.map((locale) => ({
			locale: locale,
			keys: runtimeConfig[`translations.${locale}`] || {}
		}))
	};
}

export const actions = {
	custom: async ({ request }) => {
		const formData = await request.formData();

		const parsed = z
			.object(
				typedFromEntries(
					locales.map((locale) => [
						locale,
						z.record(
							z
								.string()
								.or(
									z.record(
										z
											.string()
											.or(z.record(z.string().or(z.record(z.string().or(z.record(z.string()))))))
									)
								)
						)
					])
				)
			)
			.parse(
				typedFromEntries(
					locales.map(
						(locale) => [locale, JSON.parse(String(formData.get(locale)) || 'invalid')] as const
					)
				)
			) as Record<string, LocalesDictionary>;

		for (const [locale, keys] of typedEntries(parsed)) {
			if (
				JSON.stringify(runtimeConfig[`translations.${locale as LanguageKey}`] || {}) !==
				JSON.stringify(keys)
			) {
				runtimeConfig[`translations.${locale as LanguageKey}`] = keys;
				await collections.runtimeConfig.updateOne(
					{
						_id: `translations.${locale as LanguageKey}`
					},
					{
						$set: {
							data: keys,
							updatedAt: new Date()
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
	}
};
