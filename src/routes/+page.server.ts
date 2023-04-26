import { collections } from '$lib/server/database';
import { productToFrontend } from '$lib/types/Product';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const products = await collections.products.find({}).toArray();

	return {
		products: products.map(productToFrontend),
		pictures: await collections.pictures
			.find({ productId: { $exists: true } })
			.sort({ createdAt: 1 })
			.toArray()
	};
};
