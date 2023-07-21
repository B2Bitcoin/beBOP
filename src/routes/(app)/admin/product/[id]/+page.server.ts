import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { deletePicture } from '$lib/server/picture';
import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
import { CURRENCIES, parsePriceAmount } from '$lib/types/Currency';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { deliveryFeesSchema } from '../../config/delivery/schema';

export const load: PageServerLoad = async ({ params }) => {
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

	return {
		product,
		pictures,
		digitalFiles
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
				name: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				description: z.string().trim().max(10_000),
				shortDescription: z.string().trim().max(MAX_SHORT_DESCRIPTION_LIMIT),
				priceAmount: z.string().regex(/^\d+(\.\d+)?$/),
				availableDate: z.date({ coerce: true }).optional(),
				changedDate: z.boolean({ coerce: true }).default(false),
				preorder: z.boolean({ coerce: true }).default(false),
				shipping: z.boolean({ coerce: true }).default(false),
				displayShortDescription: z.boolean({ coerce: true }).default(false),
				deliveryFees: deliveryFeesSchema.optional(),
				applyDeliveryFeesOnlyOnce: z.boolean({ coerce: true }).default(false)
			})
			.parse({
				...json,
				availableDate: formData.get('availableDate') || undefined
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

		if (product.type === 'donation') {
			parsed.shipping = false;
		}

		const priceAmount = parsePriceAmount(parsed.priceAmount, priceCurrency);

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
					...(parsed.changedDate &&
						parsed.availableDate && { availableDate: parsed.availableDate }),
					shipping: parsed.shipping,
					displayShortDescription: parsed.displayShortDescription,
					preorder: parsed.preorder,
					...(parsed.deliveryFees && { deliveryFees: parsed.deliveryFees }),
					...(parsed.applyDeliveryFeesOnlyOnce && {
						applyDeliveryFeesOnlyOnce: parsed.applyDeliveryFeesOnlyOnce
					}),
					updatedAt: new Date()
				},
				$unset: {
					...(parsed.changedDate && !parsed.availableDate && { availableDate: '' }),
					...(!parsed.deliveryFees && { deliveryFees: '' })
				}
			}
		);

		if (!res.matchedCount) {
			throw error(404, 'Product not found');
		}

		return {};
	},

	// Todo: disable in production
	delete: async ({ params }) => {
		for await (const picture of collections.pictures.find({ productId: params.id })) {
			await deletePicture(picture._id);
		}
		await collections.products.deleteOne({ _id: params.id });

		throw redirect(303, '/admin/product');
	}
};
