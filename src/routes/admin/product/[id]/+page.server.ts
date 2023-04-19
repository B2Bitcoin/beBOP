import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { Decimal128 } from 'mongodb';

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
		product: {
			...product,
			price: {
				...product.price,
				amount: parseFloat(product.price.amount.toString())
			}
		},
		pictures
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();

		const update = z
			.object({
				name: z.string().trim().min(1).max(100).optional(),
				description: z.string().trim().max(10_000).optional(),
				priceAmount: z
					.string()
					.regex(/^\d+(\.\d+)?$/)
					.optional(),
				priceCurrency: z.enum(['BTC'])
			})
			.parse({
				name: formData.get('name'),
				description: formData.get('description'),
				priceAmount: formData.get('priceAmount'),
				priceCurrency: formData.get('priceCurrency')
			});

		const res = await collections.products.updateOne(
			{ _id: params.id },
			{
				$set: {
					name: update.name,
					description: update.description,
					price: update.priceAmount
						? {
								amount: new Decimal128(update.priceAmount),
								currency: update.priceCurrency
						  }
						: undefined,
					updatedAt: new Date()
				}
			}
		);

		if (!res.matchedCount) {
			throw error(404, 'Product not found');
		}

		return {};
	}
};
