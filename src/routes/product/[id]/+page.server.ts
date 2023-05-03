import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from './$types';
import { productToFrontend, type Product } from '$lib/types/Product';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { MAX_PRODUCT_QUANTITY } from '$lib/types/Cart';

export const load: PageServerLoad = async ({ params }) => {
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
				type: 1
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

	return {
		product: productToFrontend(product),
		pictures
	};
};

async function addToCart({ params, request, locals }: RequestEvent) {
	const product = await collections.products.findOne({ _id: params.id });

	if (!product) {
		throw error(404, 'Product not found');
	}

	const formData = await request.formData();
	const { quantity } = z
		.object({
			quantity: z.number({ coerce: true }).int().min(1).max(MAX_PRODUCT_QUANTITY)
		})
		.parse({
			quantity: formData.get('quantity') || '1'
		});

	let cart = await collections.carts.findOne({ sessionId: locals.sessionId });

	if (!cart) {
		cart = {
			_id: new ObjectId(),
			sessionId: locals.sessionId,
			items: [],
			createdAt: new Date(),
			updatedAt: new Date()
		};
	}

	const existingItem = cart.items.find((item) => item.productId === params.id);

	if (existingItem) {
		existingItem.quantity += quantity;

		if (existingItem.quantity > MAX_PRODUCT_QUANTITY) {
			existingItem.quantity = MAX_PRODUCT_QUANTITY;
		}

		if (product.type === 'subscription') {
			existingItem.quantity = 1;
		}
	} else {
		cart.items.push({
			productId: params.id,
			quantity: product.type === 'subscription' ? 1 : quantity
		});
	}

	await collections.carts.updateOne(
		{ _id: cart._id },
		{
			$set: {
				items: cart.items,
				updatedAt: new Date()
			},
			$setOnInsert: {
				createdAt: new Date(),
				sessionId: locals.sessionId
			}
		},
		{ upsert: true }
	);
}

export const actions = {
	buy: async (params) => {
		await addToCart(params);

		throw redirect(303, '/checkout');
	},

	addToCart
};
