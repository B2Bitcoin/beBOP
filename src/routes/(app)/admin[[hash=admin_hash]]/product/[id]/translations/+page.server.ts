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
			'name',
			'shortDescription',
			'description',
			'contentAfter',
			'contentBefore'
		] satisfies (keyof ProductTranslatableFields)[];

		const parsed = z
			.object({
				language: z.enum(locales as [LanguageKey, ...LanguageKey[]]),
				...mapObject(pick(productBaseSchema(), keys), (val) => val.optional()),
				cta: productBaseSchema().cta.optional(),
				variationLabels: productBaseSchema().variationLabels.optional()
			})
			.parse(json);

		const { language, ...rest } = parsed;

		if (rest.cta) {
			rest.cta = rest.cta.filter((ctaLink) => ctaLink.label && ctaLink.href);
		}
		type VariationLabels = {
			values: Record<string, Record<string, string>>;
			names: Record<string, string>;
		};
		let groupedLabels: VariationLabels[] = [];
		if (rest.variationLabels) {
			groupedLabels = Object.values(
				rest.variationLabels.reduce((acc: Record<string, VariationLabels>, { name, value }) => {
					const lowerCaseName = name.toLowerCase(); // Make name lowercase for the keys

					if (!acc[lowerCaseName]) {
						acc[lowerCaseName] = {
							values: {},
							names: {}
						};
					}

					acc[lowerCaseName].values[lowerCaseName] = acc[lowerCaseName].values[lowerCaseName] || {};
					acc[lowerCaseName].values[lowerCaseName][value] =
						value.charAt(0).toUpperCase() + value.slice(1);

					if (!acc[lowerCaseName].names[lowerCaseName]) {
						acc[lowerCaseName].names[lowerCaseName] = name.charAt(0).toUpperCase() + name.slice(1);
					}

					return acc;
				}, {})
			);
		}

		await collections.products.updateOne(
			{
				_id: params.id
			},
			{
				$set: {
					[`translations.${language}`]: { variationLabels: groupedLabels, ...rest },
					updatedAt: new Date()
				}
			}
		);
	}
};
