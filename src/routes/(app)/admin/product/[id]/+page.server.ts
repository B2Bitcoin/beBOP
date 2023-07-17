import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { deletePicture } from '$lib/server/picture';
import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
import { CURRENCIES, parsePriceAmount } from '$lib/types/Currency';

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

		const update = z
			.object({
				name: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				description: z.string().trim().max(10_000),
				shortDescription: z.string().trim().max(MAX_SHORT_DESCRIPTION_LIMIT),
				priceAmount: z.string().regex(/^\d+(\.\d+)?$/),
				availableDate: z.date({ coerce: true }).optional(),
				changedDate: z.boolean({ coerce: true }).default(false),
				preorder: z.boolean({ coerce: true }).default(false),
				shipping: z.boolean({ coerce: true }).default(false),
				displayShortDescription: z.boolean({ coerce: true }).default(false)
			})
			.parse({
				name: formData.get('name'),
				description: formData.get('description'),
				shortDescription: formData.get('shortDescription'),
				priceAmount: formData.get('priceAmount'),
				preorder: formData.get('preorder'),
				shipping: formData.get('shipping'),
				availableDate: formData.get('availableDate') || undefined,
				changedDate: formData.get('changedDate'),
				displayShortDescription: formData.get('displayShortDescription')
			});

		if (product.type !== 'resource') {
			delete update.availableDate;
			update.preorder = false;
		}

		if (!update.changedDate) {
			delete update.availableDate;
		}

		const availableDate = product.availableDate || update.availableDate;
		if (!availableDate || availableDate < new Date()) {
			update.preorder = false;
		}

		if (product.type === 'donation') {
			update.shipping = false;
		}

		const priceAmount = parsePriceAmount(update.priceAmount, priceCurrency);

		const res = await collections.products.updateOne(
			{ _id: params.id },
			{
				$set: {
					name: update.name,
					description: update.description,
					shortDescription: update.shortDescription,
					price: {
						amount: priceAmount,
						currency: priceCurrency
					},
					...(update.changedDate &&
						update.availableDate && { availableDate: update.availableDate }),
					shipping: update.shipping,
					displayShortDescription: update.displayShortDescription,
					preorder: update.preorder,
					updatedAt: new Date()
				},
				$unset: {
					...(update.changedDate && !update.availableDate && { availableDate: '' })
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
