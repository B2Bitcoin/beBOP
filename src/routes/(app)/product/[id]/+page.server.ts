import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from './$types';
import { DEFAULT_MAX_QUANTITY_PER_ORDER, type Product } from '$lib/types/Product';
import { z } from 'zod';
import { runtimeConfig } from '$lib/server/runtime-config';
import { addToCartInDb } from '$lib/server/cart';
import { parsePriceAmount } from '$lib/types/Currency';

export const load = async ({ params }) => {
	const product = await collections.products.findOne<
		Pick<
			Product,
			| '_id'
			| 'name'
			| 'price'
			| 'shortDescription'
			| 'description'
			| 'availableDate'
			| 'preorder'
			| 'type'
			| 'shipping'
			| 'displayShortDescription'
			| 'payWhatYouWant'
			| 'standalone'
			| 'maxQuantityPerOrder'
			| 'stock'
		>
	>(
		{ _id: params.id },
		{
			projection: {
				_id: 1,
				name: 1,
				price: 1,
				shortDescription: 1,
				description: 1,
				availableDate: 1,
				preorder: 1,
				type: 1,
				displayShortDescription: 1,
				payWhatYouWant: 1,
				standalone: 1,
				maxQuantityPerOrder: 1,
				stock: 1
			}
		}
	);

	if (!product) {
		throw error(404, 'Resource not found');
	}

	const pictures = await collections.pictures
		.find({ productId: params.id })
		.sort({ createdAt: 1 })
		.toArray();
	const discount = await collections.discounts
		.find({ productIds: { $in: [product._id] }, endsAt: { $gt: new Date(Date.now()) } })
		.sort({ createdAt: 1 })
		.toArray();
	return {
		product,
		pictures,
		discount,
		showCheckoutButton: runtimeConfig.checkoutButtonOnProductPage
	};
};

async function addToCart({ params, request, locals }: RequestEvent) {
	const product = await collections.products.findOne({ _id: params.id });

	if (!product) {
		throw error(404, 'Product not found');
	}

	const formData = await request.formData();
	const { quantity, customPrice } = z
		.object({
			quantity: z
				.number({ coerce: true })
				.int()
				.min(1)
				.max(product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER),
			customPrice: z.string().regex(/^\d+(\.\d+)?$/)
		})
		.parse({
			quantity: formData.get('quantity') || '1',
			customPrice: formData.get('customPrice') || '0'
		});
	const customPriceConverted = parsePriceAmount(customPrice, runtimeConfig.mainCurrency, true);
	await addToCartInDb(product, quantity, {
		sessionId: locals.sessionId,
		...(product.payWhatYouWant &&
			product.type !== 'subscription' && { customAmount: customPriceConverted })
	});
}

export const actions = {
	buy: async (params) => {
		await addToCart(params);

		throw redirect(303, '/checkout');
	},

	addToCart
};
