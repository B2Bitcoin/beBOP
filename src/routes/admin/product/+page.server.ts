import { collections } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const products = await collections.products.find({}).toArray();

	return {
		products: products.map((p) => ({
			...p,
			price: { ...p.price, amount: parseFloat(p.price.amount.toString()) }
		})),
		pictures: await collections.pictures.find({ productId: { $exists: true } }).toArray()
	};
};
