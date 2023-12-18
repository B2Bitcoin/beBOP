import { collections } from '$lib/server/database.js';
import { locales, type LanguageKey } from '$lib/translations/index.js';
import { omit, set } from 'lodash-es';
import type { JsonObject } from 'type-fest';
import { z } from 'zod';
import { tagTranslatableSchema } from '../tag-schema.js';
import { mapObject } from '$lib/utils/mapObject.js';

export const actions = {
	default: async function ({ request, params }) {
		const json: JsonObject = {};
		for (const [key, value] of await request.formData()) {
			if (value) {
				set(json, key, value);
			}
		}
		const parsed = z
			.object({
				language: z.enum(locales as [LanguageKey, ...LanguageKey[]]),
				...mapObject(omit(tagTranslatableSchema, ['cta', 'menu']), (x) => x.optional()),
				cta: tagTranslatableSchema.cta.optional(),
				menu: tagTranslatableSchema.menu.optional()
			})
			.parse(json);

		await collections.tags.updateOne(
			{
				_id: params.id
			},
			{
				$set: {
					[`translations.${parsed.language}`]: parsed,
					updatedAt: new Date()
				}
			}
		);
	}
};
