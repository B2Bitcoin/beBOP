import { collections } from '$lib/server/database';
import type { JsonObject } from 'type-fest';
import { z } from 'zod';
import { set } from 'lodash-es';
import type { Actions } from './$types';
import { runtimeConfig } from '$lib/server/runtime-config';
import { pojo } from '$lib/server/pojo';
import { PRODUCT_PAGINATION_LIMIT } from '$lib/types/Product';

export const load = async ({ url }) => {
	const querySchema = z.object({
		skip: z.number({ coerce: true }).int().min(0).optional().default(0)
	});
	const searchParams = Object.fromEntries(url.searchParams.entries());
	const result = querySchema.parse(searchParams);
	const { skip } = result;
	const products = await collections.products
		.find({})
		.skip(skip)
		.limit(PRODUCT_PAGINATION_LIMIT)
		.sort({ updatedAt: -1 })
		.toArray();

	return {
		products: products.map((product) => pojo(product)),
		pictures: await collections.pictures
			.find({ productId: { $exists: true } })
			.sort({ createdAt: 1 })
			.toArray()
	};
};

export const actions: Actions = {
	update: async ({ request }) => {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const {
			eshopVisible,
			retailVisible,
			googleShoppingVisible,
			nostrVisible,
			eshopBasket,
			retailBasket,
			nostrBasket
		} = z
			.object({
				eshopVisible: z.boolean({ coerce: true }).default(false),
				retailVisible: z.boolean({ coerce: true }).default(false),
				googleShoppingVisible: z.boolean({ coerce: true }).default(false),
				nostrVisible: z.boolean({ coerce: true }).default(false),
				eshopBasket: z.boolean({ coerce: true }).default(false),
				retailBasket: z.boolean({ coerce: true }).default(false),
				nostrBasket: z.boolean({ coerce: true }).default(false)
			})
			.parse({
				...json
			});

		await collections.runtimeConfig.updateOne(
			{
				_id: 'productActionSettings'
			},
			{
				$set: {
					data: {
						eShop: {
							visible: eshopVisible,
							canBeAddedToBasket: eshopBasket
						},
						retail: {
							visible: retailVisible,
							canBeAddedToBasket: retailBasket
						},
						googleShopping: {
							visible: googleShoppingVisible
						},
						nostr: {
							visible: nostrVisible,
							canBeAddedToBasket: nostrBasket
						}
					},
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);

		runtimeConfig.productActionSettings = {
			eShop: {
				visible: eshopVisible,
				canBeAddedToBasket: eshopBasket
			},
			retail: {
				visible: retailVisible,
				canBeAddedToBasket: retailBasket
			},
			googleShopping: {
				visible: googleShoppingVisible
			},
			nostr: {
				visible: nostrVisible,
				canBeAddedToBasket: nostrBasket
			}
		};

		return {};
	}
};
