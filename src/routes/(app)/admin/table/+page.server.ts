import { collections } from '$lib/server/database';

export async function load() {
	const products = collections.products.find({});

	return {
		products: products.toArray()
	};
}
