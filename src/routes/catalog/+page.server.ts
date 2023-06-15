import { collections } from '$lib/server/database';
import type { Product } from '$lib/types/Product';

export async function load() {
	return {
		products: collections.products
			.find({})
			.project<Pick<Product, '_id' | 'price' | 'name'>>({ price: 1, _id: 1, name: 1 })
			.toArray(),
		pictures: collections.pictures
			.find({ productId: { $exists: true } })
			.sort({ createdAt: 1 })
			.toArray()
	};
}
