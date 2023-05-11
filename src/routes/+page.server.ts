import { collections } from '$lib/server/database';
import type { Product } from '$lib/types/Product';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const products = await collections.products
		.find({})
		.project<Pick<Product, '_id' | 'price' | 'name'>>({ price: 1, _id: 1, name: 1 })
		.toArray();

	return {
		products,
		pictures: await collections.pictures
			.find({ productId: { $exists: true } })
			.sort({ createdAt: 1 })
			.toArray()
	};
};
