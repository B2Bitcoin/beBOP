import { collections } from '$lib/server/database';
import type { Product } from '$lib/types/Product';
import { POS_ROLE_ID } from '$lib/types/User.js';

type QueryType = {
	'actionSettings.eShop.visible'?: boolean;
	'actionSettings.retail.visible'?: boolean;
};

export async function load({ locals }) {
	let findProductQuery: QueryType = { 'actionSettings.eShop.visible': true };

	if (locals?.user?.role === POS_ROLE_ID) {
		findProductQuery = { 'actionSettings.retail.visible': true };
	}

	return {
		products: await collections.products
			.find(findProductQuery)
			.project<Pick<Product, '_id' | 'price' | 'name'>>({ price: 1, _id: 1, name: 1 })
			.toArray(),
		pictures: await collections.pictures
			.find({ productId: { $exists: true } })
			.sort({ createdAt: 1 })
			.toArray()
	};
}
