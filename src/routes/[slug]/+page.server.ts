import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import type { Product } from '$lib/types/Product.js';
import { picturesForProducts } from '$lib/server/picture.js';
import { omit } from 'lodash-es';
import type { Challenge } from '$lib/types/Challenge.js';

const PRODUCT_WIDGET_REGEX = /^\[Product=(?<slug>[a-z0-9-]+)\]$/i;
const CHALLENGE_WIDGET_REGEX = /^\[Challenge=(?<id>[a-z0-9-]+)\]$/i;

export async function load({ params }) {
	const cmsPage = await collections.cmsPages.findOne({
		_id: params.slug
	});

	if (!cmsPage) {
		throw error(404, 'CMS Page not found');
	}

	const productSlugs = new Set<string>();
	const challengIds = new Set<string>();

	const tokens = marked.lexer(cmsPage.content).map((token) => {
		if (token.type === 'paragraph') {
			const match = token.raw.match(PRODUCT_WIDGET_REGEX || CHALLENGE_WIDGET_REGEX);
			// const match1 = token.raw.match(CHALLENGE_WIDGET_REGEX);

			if (match?.groups?.slug || match?.groups?.id) {
				const slug = match.groups.slug;
				const id = match.groups.id;

				productSlugs.add(slug);
				challengIds.add(id);

				return {
					type: ['productWidget', 'challengeWidget'],
					raw: token.raw,
					slug,
					id
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

	const challenges = await collections.challenges
		.find({
			_id: { $in: [...challengIds] }
		})
		.project<Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt'>>({
			name: 1,
			goal: 1,
			progress: 1,
			endsAt: 1
		})
		.toArray();

	return {
		cmsPage: omit(cmsPage, ['content']),
		tokens,
		products,
		pictures: await picturesForProducts(products.map((product) => product._id)),
		challenges
	};
}
