import type { ClientSession } from 'mongodb';
import { collections } from './database';

/**
 * Amount of product reserved in carts and pending orders
 */
export async function amountOfProductReserved(
	productId: string,
	session?: ClientSession
): Promise<number> {
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
								'items.productId': productId
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
						session
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
								'payment.status': 'pending'
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
						session
					}
				)
				.next()
		)?.total ?? 0)
	);
}

export async function refreshAvailableStockInDb(productId: string, session?: ClientSession) {
	const amountInCarts = await amountOfProductReserved(productId, session);

	await collections.products.updateOne(
		{
			_id: productId,
			stock: { $exists: true }
		},
		[
			{
				$set: {
					'stock.reserved': amountInCarts,
					'stock.available': { $subtract: ['$stock.total', amountInCarts] }
				}
			}
		],
		{
			session
		}
	);
}
