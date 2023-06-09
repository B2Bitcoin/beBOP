import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import type { Product } from '$lib/types/Product.js';
import { picturesForProducts } from '$lib/server/picture.js';

const PRODUCT_WIDGET_REGEX = /^\[Product=(?<slug>[a-z0-9-]+)\]$/i;

export async function load({ params }) {
	const cmsPage = await collections.cmsPages.findOne({
		_id: params.slug
	});

	if (!cmsPage) {
		throw error(404, 'CMS Page not found');
	}

	const productSlugs = new Set<string>();

	const tokens = marked.lexer(cmsPage.content).map((token) => {
		if (token.type === 'paragraph') {
			const match = token.raw.match(PRODUCT_WIDGET_REGEX);

			if (match?.groups?.slug) {
				const slug = match.groups.slug;

				productSlugs.add(slug);

				return {
					type: 'productWidget',
					raw: token.raw,
					slug
				};
			}
		}

		return token;
	});

	const products = await collections.products
		.find({
			_id: { $in: [...productSlugs] }
		})	
		.project<
			Pick<Product, '_id' | 'price' | 'name' | 'shortDescription' | 'preorder' | 'availableDate'>
		>({
			price: 1,
			shortDescription: 1,
			preorder: 1,
			name: 1,
			availableDate: 1
		})
		.toArray();

	return {
		cmsPage,
		tokens,
		products,
		pictures: picturesForProducts(products.map((product) => product._id))
	};
}
