import type { ClientSession } from 'mongodb';
import { collections } from './database';
import type { UserIdentifier } from '$lib/types/UserIdentifier';
import { getCartFromDb } from './cart';
import type { Product } from '$lib/types/Product';
import { error } from '@sveltejs/kit';
import { sumCurrency } from '$lib/utils/sumCurrency';
import { Price } from '$lib/types/Order';

/**
 * Amount of product reserved in carts and pending orders
 */
export async function amountOfProductReserved(
	productId: string,
	opts?: {
		/** Include stock for outdated carts with this id */
		include?: UserIdentifier;
		/** Exclude stock for active carts with this id */
		exclude?: UserIdentifier;
		session?: ClientSession;
	}
): Promise<number> {
	const userIdentifier = opts?.include ?? opts?.exclude;
	const cart = userIdentifier ? await getCartFromDb({ user: userIdentifier }) : undefined;

	return (
		((
			await collections.carts
				.aggregate(
					[
						{
							$match: {
								'items.productId': productId
							}
						},
						{
							$unwind: '$items'
						},
						{
							$match: {
								'items.productId': productId,
								$or: [
									{
										'items.reservedUntil': { $gt: new Date() }
									},
									...(opts?.include && cart
										? [
												{
													_id: cart._id
												}
										  ]
										: [])
								],
								...(opts?.exclude && cart && { _id: { $ne: cart._id } })
							}
						},
						{
							$group: {
								_id: null,
								total: {
									$sum: '$items.quantity'
								}
							}
						}
					],
					{
						session: opts?.session
					}
				)
				.next()
		)?.total ?? 0) +
		((
			await collections.orders
				.aggregate(
					[
						{
							$match: {
								'items.product._id': productId,
								status: 'pending'
							}
						},
						{
							$unwind: '$items'
						},
						{
							$match: {
								'items.product._id': productId
							}
						},
						{
							$group: {
								_id: null,
								total: {
									$sum: '$items.quantity'
								}
							}
						}
					],
					{
						session: opts?.session
					}
				)
				.next()
		)?.total ?? 0)
	);
}

export async function refreshAvailableStockInDb(productId: string, session?: ClientSession) {
	const amountReserved = await amountOfProductReserved(productId, { session });

	await collections.products.updateOne(
		{
			_id: productId,
			stock: { $exists: true }
		},
		[
			{
				$set: {
					'stock.reserved': amountReserved,
					'stock.available': { $subtract: ['$stock.total', amountReserved] }
				}
			}
		],
		{
			session
		}
	);
}

export async function amountOfProductSold(productId: string): Promise<number> {
	return (
		(
			await collections.orders
				.aggregate([
					{
						$match: {
							'items.product._id': productId,
							status: 'paid'
						}
					},
					{
						$unwind: '$items'
					},
					{
						$match: {
							'items.product._id': productId
						}
					},
					{
						$group: {
							_id: null,
							total: {
								$sum: '$items.quantity'
							}
						}
					}
				])
				.next()
		)?.total ?? 0
	);
}

export function sumVariationDeltaProduct(
	product: Product,
	chosenVariations: Record<string, string> | undefined
) {
	let variationPriceArray: Price[] = [];
	const variationNamesInDB = [...new Set(product.variations?.map((vari) => vari.name))];
	const chosenVariationNames = Object.keys(chosenVariations ?? {});

	const allVariationsChosen =
		variationNamesInDB.length === chosenVariationNames.length &&
		variationNamesInDB.every((name) => chosenVariationNames.includes(name));

	if (allVariationsChosen) {
		variationPriceArray = chosenVariations
			? Object.entries(chosenVariations).map((variation) => ({
					amount:
						product.variations?.find(
							(vari) => variation[0] === vari.name && variation[1] === vari.value
						)?.price ?? 0,
					currency: product.price.currency
			  }))
			: [];
	} else {
		throw error(400, 'error matching on variations choice');
	}

	return product.hasVariations && chosenVariations
		? sumCurrency(product.price.currency, variationPriceArray)
		: 0;
}
