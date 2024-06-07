import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import type { Product } from '$lib/types/Product';
import type { Tag } from '$lib/types/Tag';

export const load = async ({ locals }) => {
	const query =
		locals.user?.roleId === locals.user?.roleId
			? { 'actionSettings.retail.visible': true }
			: { 'actionSettings.eShop.visible': true };

	const products = await collections.products
		.find({
			...query
		})
		.project<Pick<Product, '_id' | 'price' | 'name' | 'preorder' | 'availableDate' | 'tagIds'>>({
			price: 1,
			preorder: 1,
			name: locals.language ? { $ifNull: [`$translations.${locals.language}.name`, '$name'] } : 1,
			availableDate: 1,
			tagIds: 1
		})
		.sort({ createdAt: 1 })
		.toArray();
	const tags = await collections.tags
		.find({ _id: { $in: [...runtimeConfig.posTouchTag] } })
		.project<Pick<Tag, '_id' | 'name'>>({ _id: 1, name: 1 })
		.toArray();
	return {
		products,
		pictures: await collections.pictures
			.find({ productId: { $in: [...products.map((product) => product._id)] } })
			.sort({ createdAt: 1 })
			.toArray(),
		tags
	};
};
