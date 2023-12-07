import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { DEFAULT_MAX_QUANTITY_PER_ORDER, type Product } from '$lib/types/Product';
import { z } from 'zod';
import { runtimeConfig } from '$lib/server/runtime-config';
import { addToCartInDb } from '$lib/server/cart';
import { CURRENCIES, parsePriceAmount } from '$lib/types/Currency';
import { userIdentifier, userQuery } from '$lib/server/user';
import { POS_ROLE_ID } from '$lib/types/User';
import { cmsFromContent } from '$lib/server/cms';

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
			| 'customPreorderText'
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
				customPreorderText: 1,
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
	return {
		product,
		pictures,
		discount,
		...(product.contentBefore && {
			productCMSBefore: cmsFromContent(product.contentBefore, locals?.user?.roleId)
		}),
		...(product.contentAfter && {
			productCMSAfter: cmsFromContent(product.contentAfter, locals?.user?.roleId)
		}),
		showCheckoutButton: runtimeConfig.checkoutButtonOnProductPage
	};
};

async function addToCart({ params, request, locals }: RequestEvent) {
	const product = await collections.products.findOne({ _id: params.id });

	if (!product) {
		throw error(404, 'Product not found');
	}

	const formData = await request.formData();
	const { quantity, customPriceAmount, customPriceCurrency } = z
		.object({
			quantity: z
				.number({ coerce: true })
				.int()
				.min(1)
				.max(product.maxQuantityPerOrder || DEFAULT_MAX_QUANTITY_PER_ORDER)
				.default(1),
			customPriceAmount: z
				.string()
				.regex(/^\d+(\.\d+)?$/)
				.optional(),
			customPriceCurrency: z.enum([CURRENCIES[0], ...CURRENCIES.slice(1)]).optional()
		})
		.parse({
			quantity: formData.get('quantity') || undefined,
			customPriceAmount: formData.get('customPriceAmount') || undefined,
			customPriceCurrency: formData.get('customPriceCurrency') || undefined
		});
	const customPrice =
		customPriceAmount && customPriceCurrency
			? {
					amount: parsePriceAmount(customPriceAmount, customPriceCurrency),
					currency: customPriceCurrency
			  }
			: undefined;
	await addToCartInDb(product, quantity, {
		user: userIdentifier(locals),
		...(product.payWhatYouWant && { customPrice })
	});
}

export const actions = {
	buy: async (params) => {
		await addToCart(params);

		throw redirect(303, '/checkout');
	},

	addToCart
};
