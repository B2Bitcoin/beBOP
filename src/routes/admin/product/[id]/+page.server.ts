import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { Decimal128 } from 'mongodb';
import { deletePicture } from '$lib/server/picture';
import { productToFrontend } from '$lib/types/Product';

export const load: PageServerLoad = async ({ params }) => {
	const product = await collections.products.findOne({ _id: params.id });

	if (!product) {
		throw error(404, 'Product not found');
	}

	const pictures = await collections.pictures
		.find({ productId: params.id })
		.sort({ createdAt: 1 })
		.toArray();

	return {
		product: productToFrontend(product),
		pictures
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();

		const product = await collections.products.findOne({ _id: params.id });

		if (!product) {
			throw error(404, 'Product not found');
		}

		const update = z
			.object({
				name: z.string().trim().min(1).max(100),
				description: z.string().trim().max(10_000),
				shortDescription: z.string().trim().max(250),
				priceAmount: z.string().regex(/^\d+(\.\d+)?$/),
				priceCurrency: z.enum(['BTC']),
				availableDate: z.date({ coerce: true }).optional(),
				changedDate: z.boolean({ coerce: true }).default(false),
				preorder: z.boolean({ coerce: true }).default(false),
				shipping: z.boolean({ coerce: true }).default(false)
			})
			.parse({
				name: formData.get('name'),
				description: formData.get('description'),
				shortDescription: formData.get('shortDescription'),
				priceAmount: formData.get('priceAmount'),
				priceCurrency: formData.get('priceCurrency'),
				preorder: formData.get('preorder'),
				shipping: formData.get('shipping'),
				availableDate: formData.get('availableDate') || undefined,
				changedDate: formData.get('changedDate')
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

		const res = await collections.products.updateOne(
			{ _id: params.id },
			{
				$set: {
					name: update.name,
					description: update.description,
					shortDescription: update.shortDescription,
					price: update.priceAmount
						? {
								amount: new Decimal128(update.priceAmount),
								currency: update.priceCurrency
						  }
						: undefined,
					...(update.changedDate &&
						update.availableDate && { availableDate: update.availableDate }),
					shipping: update.shipping,
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
