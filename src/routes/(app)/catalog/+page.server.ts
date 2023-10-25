import { collections } from '$lib/server/database';
import type { Product } from '$lib/types/Product';
import { POS_ROLE_ID } from '$lib/types/User.js';

type QueryType = {
	'actionSettings.eShop.visible'?: boolean;
	'actionSettings.retail.visible'?: boolean;
};

export async function load({ locals }) {
	const findProductQuery = getFindProductQuery(locals?.user?.role);

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

function getFindProductQuery(userRole?: string): QueryType {
	if (userRole === POS_ROLE_ID) {
		return { 'actionSettings.retail.visible': true };
	}
	return { 'actionSettings.eShop.visible': true };
}
