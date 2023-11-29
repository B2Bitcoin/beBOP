import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { deletePicture } from '$lib/server/picture';
import { CURRENCIES, parsePriceAmount } from '$lib/types/Currency';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { productBaseSchema } from '../product-schema';
import { amountOfProductReserved, amountOfProductSold } from '$lib/server/product';
import type { Tag } from '$lib/types/Tag';
import { adminPrefix } from '$lib/server/admin';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';

export const load = async ({ params }) => {
	const product = await collections.products.findOne({ _id: params.id });

	if (!product) {
		throw error(404, 'Product not found');
	}

	const pictures = await collections.pictures
		.find({ productId: params.id })
		.sort({ createdAt: 1 })
		.toArray();
	const digitalFiles = await collections.digitalFiles
		.find({ productId: params.id })
		.sort({ createdAt: 1 })
		.toArray();
	const tags = await collections.tags
		.find({})
		.project<Pick<Tag, '_id' | 'name'>>({ _id: 1, name: 1 })
		.toArray();

	return {
		product,
		pictures,
		digitalFiles,
		tags,
		reserved: amountOfProductReserved(params.id),
		sold: amountOfProductSold(params.id)
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const product = await collections.products.findOne({ _id: params.id });

		if (!product) {
			throw error(404, 'Product not found');
		}

		const { priceCurrency } = z
			.object({
				priceCurrency: z.enum([CURRENCIES[0], ...CURRENCIES.slice(1)])
			})
			.parse({
				priceCurrency: formData.get('priceCurrency')
			});

		const parsed = z
			.object({
				tagIds: z.string().array(),
				...productBaseSchema,
				changedDate: z.boolean({ coerce: true }).default(false),
				contentBefore: z.string().max(MAX_CONTENT_LIMIT),
				contentAfter: z.string().max(MAX_CONTENT_LIMIT)
			})
			.parse({
				...json,
				availableDate: formData.get('availableDate') || undefined,
				tagIds: JSON.parse(String(formData.get('tagIds'))).map((x: { value: string }) => x.value),
				contentBefore: formData.get('contentBefore'),
				contentAfter: formData.get('contentAfter')
			});

		if (product.type !== 'resource') {
			delete parsed.availableDate;
			parsed.preorder = false;
		}

		if (!parsed.changedDate) {
			delete parsed.availableDate;
		}

		const availableDate = product.availableDate || parsed.availableDate;
		if (!availableDate || availableDate < new Date()) {
			parsed.preorder = false;
		}

		if (product.availableDate && !parsed.availableDate) {
			parsed.availableDate = product.availableDate;
		}

		if (product.type === 'donation') {
			parsed.shipping = false;
		}

		const priceAmount = parsed.free ? 0 : parsePriceAmount(parsed.priceAmount, priceCurrency);

		if (!parsed.free && !parsed.payWhatYouWant && parsed.priceAmount === '0') {
			parsed.free = true;
		}
		const amountInCarts = await amountOfProductReserved(params.id);

		const res = await collections.products.updateOne(
			{ _id: params.id },
			{
				$set: {
					name: parsed.name,
					description: parsed.description,
					shortDescription: parsed.shortDescription,
					price: {
						amount: priceAmount,
						currency: priceCurrency
					},
					...(parsed.availableDate && { availableDate: parsed.availableDate }),
					shipping: parsed.shipping,
					displayShortDescription: parsed.displayShortDescription,
					preorder: parsed.preorder,
					payWhatYouWant: parsed.payWhatYouWant,
					standalone: parsed.payWhatYouWant || parsed.standalone,
					free: parsed.free,
					...(parsed.deliveryFees && { deliveryFees: parsed.deliveryFees }),
					applyDeliveryFeesOnlyOnce: parsed.applyDeliveryFeesOnlyOnce,
					requireSpecificDeliveryFee: parsed.requireSpecificDeliveryFee,
					...(parsed.maxQuantityPerOrder && { maxQuantityPerOrder: parsed.maxQuantityPerOrder }),
					...(parsed.stock !== undefined && {
						stock: {
							total: parsed.stock,
							reserved: amountInCarts,
							available: parsed.stock - amountInCarts
						}
					}),
					actionSettings: {
						eShop: {
							visible: parsed.eshopVisible,
							canBeAddedToBasket: parsed.eshopBasket
						},
						retail: {
							visible: parsed.retailVisible,
							canBeAddedToBasket: parsed.retailBasket
						},
						googleShopping: {
							visible: parsed.googleShoppingVisible
						}
					},
					tagIds: parsed.tagIds,
					contentBefore: parsed.contentBefore,
					contentAfter: parsed.contentAfter,
					updatedAt: new Date()
				},
				$unset: {
					...(!parsed.availableDate && { availableDate: '' }),
					...(!parsed.deliveryFees && { deliveryFees: '' }),
					...(parsed.stock === undefined && { stock: '' }),
					...(!parsed.maxQuantityPerOrder && { maxQuantityPerOrder: '' })
				}
			}
		);

		if (!res.matchedCount) {
			throw error(404, 'Product not found');
		}

		return {};
	},

	delete: async ({ params }) => {
		for await (const picture of collections.pictures.find({ productId: params.id })) {
			await deletePicture(picture._id);
		}
		await collections.products.deleteOne({ _id: params.id });

		throw redirect(303, `${adminPrefix()}/product`);
	}
};
