import type { ClientSession } from 'mongodb';
import { collections } from './database';
import type { UserIdentifier } from '$lib/types/UserIdentifier';
import { getCartFromDb } from './cart';

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
