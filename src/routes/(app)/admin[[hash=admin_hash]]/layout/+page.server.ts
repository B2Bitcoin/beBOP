import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { z } from 'zod';
import type { JsonObject } from 'type-fest';
import { set, isEqual } from 'lodash-es';
import { layoutTranslatableSchema } from './layout-schema';
import { typedKeys } from '$lib/utils/typedKeys';

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const res = z
			.object({
				usersDarkDefaultTheme: z.boolean({ coerce: true }),
				employeesDarkDefaultTheme: z.boolean({ coerce: true }),
				showDarkModeSwitch: z.boolean({ coerce: true }),
				showLanguageSwitch: z.boolean({ coerce: true }),
				...layoutTranslatableSchema,
				socialNetworkIcons: z
					.array(
						z.object({ name: z.string().trim(), svg: z.string().trim(), href: z.string().trim() })
					)
					.optional(),
				displayPoweredBy: z.boolean({ coerce: true }),
				displayCompanyInfo: z.boolean({ coerce: true })
			})
			.parse(json);

		const { socialNetworkIcons, ...runtimeConfigUpdates } = res;

		for (const linkKey of ['topbarLinks', 'navbarLinks', 'footerLinks'] as const) {
			res[linkKey] = res[linkKey]?.filter((item) => item.href && item.label);
		}
		res.socialNetworkIcons = socialNetworkIcons?.filter(
			(item) => item.href && item.svg && item.name
		);

		for (const key of typedKeys(runtimeConfigUpdates)) {
			if (!isEqual(runtimeConfig[key], runtimeConfigUpdates[key])) {
				runtimeConfig[key] = runtimeConfigUpdates[key] as never;
				await collections.runtimeConfig.updateOne(
					{ _id: key },
					{
						$set: { data: runtimeConfigUpdates[key], updatedAt: new Date() },
						$setOnInsert: { createdAt: new Date() }
					},
					{ upsert: true }
				);
			}
		}
	}
};
