import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { DEFAULT_MAX_QUANTITY_PER_ORDER, type Product } from '$lib/types/Product';
import { z } from 'zod';
import { runtimeConfig } from '$lib/server/runtime-config';
import { addToCartInDb } from '$lib/server/cart';
import { parsePriceAmount } from '$lib/types/Currency';
import { userIdentifier, userQuery } from '$lib/server/user';
import { POS_ROLE_ID } from '$lib/types/User';
import { trimSuffix } from '$lib/utils/trimSuffix';
import { trimPrefix } from '$lib/utils/trimPrefix';
import { picturesForProducts, picturesForSliders } from '$lib/server/picture';
import type { DigitalFile } from '$lib/types/DigitalFile';
import type { Challenge } from '$lib/types/Challenge';

export const load = async ({ params, locals }) => {
	const product = await collections.products.findOne<
		Pick<
			Product,
			| '_id'
			| 'name'
			| 'price'
			| 'shortDescription'
			| 'description'
			| 'availableDate'
			| 'preorder'
			| 'type'
			| 'shipping'
			| 'displayShortDescription'
			| 'payWhatYouWant'
			| 'standalone'
			| 'maxQuantityPerOrder'
			| 'stock'
			| 'actionSettings'
			| 'contentBefore'
			| 'contentAfter'
		>
	>(
		{ _id: params.id },
		{
			projection: {
				_id: 1,
				name: 1,
				price: 1,
				shortDescription: 1,
				description: 1,
				availableDate: 1,
				preorder: 1,
				type: 1,
				displayShortDescription: 1,
				payWhatYouWant: 1,
				standalone: 1,
				maxQuantityPerOrder: 1,
				stock: 1,
				actionSettings: 1,
				contentBefore: 1,
				contentAfter: 1
			}
		}
	);

	if (!product) {
		throw error(404, 'Resource not found');
	}

	if (
		locals.user?.roleId === POS_ROLE_ID
			? !product.actionSettings.retail.visible
			: !product.actionSettings.eShop.visible
	) {
		throw redirect(303, '/');
	}

	const pictures = await collections.pictures
		.find({ productId: params.id })
		.sort({ createdAt: 1 })
		.toArray();
	const subscriptions = await collections.paidSubscriptions
		.find({
			...userQuery(userIdentifier(locals)),
			paidUntil: { $gt: new Date() }
		})
		.toArray();
	const discount = await collections.discounts.findOne(
		{
			$or: [{ wholeCatalog: true }, { productIds: product._id }],
			subscriptionIds: { $in: subscriptions.map((sub) => sub.productId) },
			endsAt: { $gt: new Date() }
		},
		{
			sort: { percentage: -1 }
		}
	);
	const productsBefore = product.contentBefore
		? (await getCMSProduct(product.contentBefore, locals?.user?.roleId)).products
		: [];
	const picturesBefore = product.contentBefore
		? (await getCMSProduct(product.contentBefore, locals?.user?.roleId)).pictures
		: [];
	const digitalFilesBefore = product.contentBefore
		? (await getCMSProduct(product.contentBefore, locals?.user?.roleId)).digitalFiles
		: [];
	const challenges = product.contentBefore
		? (await getCMSProduct(product.contentBefore, locals?.user?.roleId)).challenges
		: [];
	const tokens = product.contentBefore
		? (await getCMSProduct(product.contentBefore, locals?.user?.roleId)).tokens
		: [];
	const sliders = product.contentBefore
		? (await getCMSProduct(product.contentBefore, locals?.user?.roleId)).sliders
		: [];
	const slidersPictures = product.contentBefore
		? (await getCMSProduct(product.contentBefore, locals?.user?.roleId)).slidersPictures
		: [];
	const challengesAfter = product.contentAfter
		? (await getCMSProduct(product.contentAfter, locals?.user?.roleId)).challenges
		: [];
	const tokensAfter = product.contentAfter
		? (await getCMSProduct(product.contentAfter, locals?.user?.roleId)).tokens
		: [];
	const slidersAfter = product.contentAfter
		? (await getCMSProduct(product.contentAfter, locals?.user?.roleId)).sliders
		: [];
	const slidersPicturesAfter = product.contentAfter
		? (await getCMSProduct(product.contentAfter, locals?.user?.roleId)).slidersPictures
		: [];
	const productsAfter = product.contentAfter
		? (await getCMSProduct(product.contentAfter, locals?.user?.roleId)).products
		: [];
	const picturesAfter = product.contentAfter
		? (await getCMSProduct(product.contentAfter, locals?.user?.roleId)).pictures
		: [];
	const digitalFilesAfter = product.contentAfter
		? (await getCMSProduct(product.contentAfter, locals?.user?.roleId)).digitalFiles
		: [];
	return {
		product,
		pictures,
		discount,
		challenges,
		tokens,
		sliders,
		slidersPictures,
		challengesAfter,
		tokensAfter,
		slidersAfter,
		slidersPicturesAfter,
		productsBefore,
		productsAfter,
		picturesBefore,
		picturesAfter,
		digitalFilesAfter,
		digitalFilesBefore,
		roleId: locals.user?.roleId,
		showCheckoutButton: runtimeConfig.checkoutButtonOnProductPage
	};
};

async function addToCart({ params, request, locals }: RequestEvent) {
	const product = await collections.products.findOne({ _id: params.id });

	if (!product) {
		throw error(404, 'Product not found');
	}

	const formData = await request.formData();
	const { quantity, customPrice } = z
		.object({
			quantity: z
				.number({ coerce: true })
				.int()
				.min(1)
				.max(product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER),
			customPrice: z.string().regex(/^\d+(\.\d+)?$/)
		})
		.parse({
			quantity: formData.get('quantity') || '1',
			customPrice: formData.get('customPrice') || '0'
		});
	const customPriceConverted = parsePriceAmount(customPrice, runtimeConfig.mainCurrency, true);
	await addToCartInDb(product, quantity, {
		user: userIdentifier(locals),
		...(product.payWhatYouWant &&
			product.type !== 'subscription' && { customAmount: customPriceConverted })
	});
}

export const actions = {
	buy: async (params) => {
		await addToCart(params);

		throw redirect(303, '/checkout');
	},

	addToCart
};

async function getCMSProduct(content: string, userRoleId: string) {
	const PRODUCT_WIDGET_REGEX =
		/\[Product=(?<slug>[a-z0-9-]+)(?:\?display=(?<display>[a-z0-9-]+))?\]/gi;
	const CHALLENGE_WIDGET_REGEX = /\[Challenge=(?<slug>[a-z0-9-]+)\]/gi;
	const SLIDER_WIDGET_REGEX =
		/\[Slider=(?<slug>[a-z0-9-]+)(?:\?autoplay=(?<autoplay>[a-z0-9-]+))?\]/gi;

	const productSlugs = new Set<string>();
	const challengeSlugs = new Set<string>();
	const sliderSlugs = new Set<string>();

	const tokens: Array<
		| {
				type: 'html';
				raw: string;
		  }
		| {
				type: 'productWidget';
				slug: string;
				display: string | undefined;
				raw: string;
		  }
		| {
				type: 'challengeWidget';
				slug: string;
				raw: string;
		  }
		| {
				type: 'sliderWidget';
				slug: string;
				autoplay: number | undefined;
				raw: string;
		  }
	> = [];

	const productMatches = content.matchAll(PRODUCT_WIDGET_REGEX);
	const challengeMatches = content.matchAll(CHALLENGE_WIDGET_REGEX);
	const sliderMatches = content.matchAll(SLIDER_WIDGET_REGEX);

	let index = 0;

	const orderedMatches = [
		...[...productMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'productWidget' })
		),
		...[...challengeMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'challengeWidget' })
		),
		...[...sliderMatches].map((m) =>
			Object.assign(m, { index: m.index ?? 0, type: 'sliderWidget' })
		)
	].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

	for (const match of orderedMatches) {
		tokens.push({
			type: 'html',
			raw: trimPrefix(trimSuffix(content.slice(index, match.index), '<p>'), '</p>')
		});
		if (match.type === 'productWidget' && match.groups?.slug) {
			productSlugs.add(match.groups.slug);
			tokens.push({
				type: 'productWidget',
				slug: match.groups.slug,
				display: match.groups?.display,
				raw: match[0]
			});
		} else if (match.type === 'challengeWidget' && match.groups?.slug) {
			challengeSlugs.add(match.groups.slug);
			tokens.push({
				type: 'challengeWidget',
				slug: match.groups.slug,
				raw: match[0]
			});
		} else if (match.type === 'sliderWidget' && match.groups?.slug) {
			sliderSlugs.add(match.groups.slug);
			tokens.push({
				type: 'sliderWidget',
				slug: match.groups.slug,
				autoplay: Number(match.groups?.autoplay),
				raw: match[0]
			});
		}

		index = match.index + match[0].length;
	}

	tokens.push({
		type: 'html',
		raw: trimPrefix(content.slice(index), '</p>')
	});
	const query =
		userRoleId === POS_ROLE_ID
			? { 'actionSettings.retail.visible': true }
			: { 'actionSettings.eShop.visible': true };

	const products = await collections.products
		.find({
			_id: { $in: [...productSlugs] },
			...query
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
				| 'actionSettings'
			>
		>({
			price: 1,
			shortDescription: 1,
			preorder: 1,
			name: 1,
			availableDate: 1,
			type: 1,
			shipping: 1,
			actionSettings: 1
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
	const sliders = await collections.sliders
		.find({
			_id: { $in: [...sliderSlugs] }
		})
		.toArray();

	const digitalFiles = await collections.digitalFiles
		.find({})
		.project<Pick<DigitalFile, '_id' | 'name' | 'productId'>>({
			name: 1,
			productId: 1
		})
		.sort({ createdAt: 1 })
		.toArray();
	return {
		tokens,
		challenges,
		sliders,
		slidersPictures: await picturesForSliders(sliders.map((slider) => slider._id)),
		products,
		pictures: await picturesForProducts(products.map((product) => product._id)),
		digitalFiles
	};
}
