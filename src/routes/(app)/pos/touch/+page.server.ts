import { collections } from '$lib/server/database';
import type { Product } from '$lib/types/Product';

export const load = async ({ locals }) => {
	const products = await collections.products
		.find({
			tagIds: 'pos-favorite'
		})
		.project<Pick<Product, '_id' | 'price' | 'name'>>({
			price: 1,
			name: locals.language ? { $ifNull: [`$translations.${locals.language}.name`, '$name'] } : 1
		})
		.toArray();

	return {
		products,
		pictures: await collections.pictures.find({productId: { $in: [...products.map((product) => product._id)] }})
			.sort({ createdAt: 1 })
			.toArray()
	};
};