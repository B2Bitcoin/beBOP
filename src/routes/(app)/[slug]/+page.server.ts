import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import type { Product } from '$lib/types/Product.js';
import { picturesForProducts } from '$lib/server/picture.js';
import { omit } from 'lodash-es';
import type { Challenge } from '$lib/types/Challenge.js';

const PRODUCT_WIDGET_REGEX = /^\[Product=(?<slug>[a-z0-9-]+)\]$/i;
const CHALLENGE_WIDGET_REGEX = /^\[Challenge=(?<slug>[a-z0-9-]+)\]$/i;

export async function load({ params }) {
	const cmsPage = await collections.cmsPages.findOne({
		_id: params.slug
	});

	if (!cmsPage) {
		throw error(404, 'CMS Page not found');
	}

	const productSlugs = new Set<string>();
	const challengeSlugs = new Set<string>();

	const tokens = marked.lexer(cmsPage.content).map((token) => {
		if (token.type === 'paragraph') {
			let match = token.raw.match(PRODUCT_WIDGET_REGEX);

			if (match?.groups?.slug) {
				const slug = match.groups.slug;

				productSlugs.add(slug);

				return {
					type: 'productWidget',
					raw: token.raw,
					slug
				} as const;
			}

			match = token.raw.match(CHALLENGE_WIDGET_REGEX);

			if (match?.groups?.slug) {
				const slug = match.groups.slug;

				challengeSlugs.add(slug);

				return {
					type: 'challengeWidget',
					raw: token.raw,
					slug
				} as const;
			}
		}

		return token;
	});

	const products = await collections.products
		.find({
			_id: { $in: [...productSlugs] }
		})
		.project<
			Pick<
				Product,
				| '_id'
				| 'price'
				| 'name'
				| 'shortDescription'
				| 'preorder'
				| 'availableDate'
				| 'type'
				| 'shipping'
			>
		>({
			price: 1,
			shortDescription: 1,
			preorder: 1,
			name: 1,
			availableDate: 1,
			type: 1,
			shipping: 1
		})
		.toArray();

	const challenges = await collections.challenges
		.find({
			_id: { $in: [...challengeSlugs] }
		})
		.project<Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt'>>({
			name: 1,
			goal: 1,
			progress: 1,
			endsAt: 1
		})
		.toArray();

	// Everything is awaited, because the home page can call this load function in a sub param
	return {
		cmsPage: omit(cmsPage, ['content']),
		tokens,
		products,
		pictures: await picturesForProducts(products.map((product) => product._id)),
		challenges
	};
}
