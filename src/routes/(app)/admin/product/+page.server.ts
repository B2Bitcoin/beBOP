import { collections } from '$lib/server/database';

export const load = async () => {
	const products = await collections.products.find({}).toArray();

	return {
		products,
		pictures: await collections.pictures
			.find({ productId: { $exists: true } })
			.sort({ createdAt: 1 })
			.toArray()
	};
};
