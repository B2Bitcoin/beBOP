import { collections } from '$lib/server/database';
import type { Product } from '$lib/types/Product';
import { POS_ROLE_ID } from '$lib/types/User.js';

export async function load({ locals }) {
	const query =
		locals?.user?.role === POS_ROLE_ID
			? { 'actionSettings.retail.visible': true }
			: { 'actionSettings.eShop.visible': true };

	return {
		products: await collections.products
			.find(query)
			.project<Pick<Product, '_id' | 'price' | 'name'>>({ price: 1, _id: 1, name: 1 })
			.toArray(),
		pictures: await collections.pictures
			.find({ productId: { $exists: true } })
			.sort({ createdAt: 1 })
			.toArray()
	};
}
