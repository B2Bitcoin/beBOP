import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { productToFrontend } from '$lib/types/Product';

export const load: PageServerLoad = async ({ params }) => {
	const product = await collections.products.findOne({ _id: params.id });

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
