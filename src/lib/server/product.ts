import type { ClientSession } from 'mongodb';
import { collections } from './database';
import { subMinutes } from 'date-fns';
import { runtimeConfig } from './runtime-config';

/**
 * Amount of product reserved in carts and pending orders
 */
export async function amountOfProductReserved(
	productId: string,
	opts?: {
		include?: {
			/** Include stock for outdated carts with this npub */
			npub?: string;
			/** Include stock for outdated carts with this sessionId */
			sessionId?: string;
		};
		exclude?: {
			/** Exclude stock for active carts with this npub */
			npub?: string;
			/** Exclude stock for active carts with this sessionId */
			sessionId?: string;
		};
		session?: ClientSession;
	}
): Promise<number> {
	return (
		((
			await collections.carts
				.aggregate(
					[
						{
							$match: {
								'items.productId': productId,
								$or: [
									{
										updatedAt: { $gt: subMinutes(new Date(), runtimeConfig.reserveStockInMinutes) }
									},
									...(opts?.include?.npub
										? [
												{
													npub: opts.include.npub
												}
										  ]
										: []),
									...(opts?.include?.sessionId
										? [
												{
													sessionId: opts.include.sessionId
												}
										  ]
										: [])
								],
								...(opts?.exclude?.npub && { npub: { $ne: opts.exclude.npub } }),
								...(opts?.exclude?.sessionId && { sessionId: { $ne: opts.exclude.sessionId } })
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
						session: opts?.session
					}
				)
				.next()
		)?.total ?? 0)
	);
}

export async function refreshAvailableStockInDb(productId: string, session?: ClientSession) {
	const amountInCarts = await amountOfProductReserved(productId, { session });

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

export async function amountOfProductSold(productId: string): Promise<number> {
	return (
		(
			await collections.orders
				.aggregate([
					{
						$match: {
							'items.product._id': productId,
							'payment.status': 'paid'
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
