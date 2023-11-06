import { collections } from '$lib/server/database';
import { picturesForProducts } from '$lib/server/picture.js';
import type { Product } from '$lib/types/Product';
import { POS_ROLE_ID } from '$lib/types/User.js';

export async function load({ locals }) {
	const query =
		locals?.user?.roleId === POS_ROLE_ID
			? { 'actionSettings.retail.visible': true }
			: { 'actionSettings.eShop.visible': true };

	const products = await collections.products
		.find(query)
		.project<Pick<Product, '_id' | 'price' | 'name'>>({ price: 1, _id: 1, name: 1 })
		.toArray();

	const productIds = products.map((product) => product._id);

	return {
		products: products,
		pictures: await picturesForProducts(productIds)
	};
}
