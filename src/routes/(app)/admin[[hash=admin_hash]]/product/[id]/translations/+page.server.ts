import { locales, type LanguageKey } from '$lib/translations/index.js';
import { mapObject } from '$lib/utils/mapObject.js';
import { z } from 'zod';
import { productBaseSchema } from '../../product-schema.js';
import { pick, set } from 'lodash-es';
import type { ProductTranslatableFields } from '$lib/types/Product.js';
import { collections } from '$lib/server/database.js';
import type { JsonObject } from 'type-fest';

export const actions = {
	default: async function ({ request, params }) {
		const json: JsonObject = {};

		for (const [key, value] of await request.formData()) {
			if (value) {
				set(json, key, value);
			}
		}

		const keys = [
			'customPreorderText',
			'cta',
			'name',
			'shortDescription',
			'description',
			'contentAfter',
			'contentBefore'
		] satisfies (keyof ProductTranslatableFields)[];

		const parsed = z
			.object({
				language: z.enum(locales as [LanguageKey, ...LanguageKey[]]),
				...mapObject(pick(productBaseSchema, keys), (val) => val.optional())
			})
			.parse(json);

		const { language, ...rest } = parsed;

		await collections.products.updateOne(
			{
				_id: params.id
			},
			{
				$set: {
					[`translations.${language}`]: rest,
					updatedAt: new Date()
				}
			}
		);
	}
};
