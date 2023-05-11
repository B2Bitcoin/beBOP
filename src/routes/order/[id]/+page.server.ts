import { collections } from '$lib/server/database.js';
import type { Picture } from '$lib/types/Picture.js';
import { UrlDependency } from '$lib/types/UrlDependency.js';
import { error } from '@sveltejs/kit';

export async function load({ params, depends }) {
	const order = await collections.orders.findOne({
		_id: params.id
	});

	if (!order) {
		throw error(404, 'Order not found');
	}

	depends(UrlDependency.Order);

	const pictures = await collections.pictures
		.aggregate<Picture>([
			{ $match: { productId: { $in: order.items.map((item) => item.product._id) } } },
			{ $sort: { createdAt: 1 } },
			{
				$group: {
					_id: '$productId',
					value: { $first: '$$ROOT' }
				}
			},
			{ $replaceRoot: { newRoot: '$value' } }
		])
		.toArray();

	return {
		order: {
			number: order.number,
			payment: order.payment,
			items: order.items.map((item) => ({
				quantity: item.quantity,
				product: {
					_id: item.product._id,
					price: item.product.price,
					name: item.product.name,
					shortDescription: item.product.shortDescription,
					type: item.product.type,
					preorder: item.product.preorder,
					availableDate: item.product.availableDate
				},
				picture: pictures.find((picture) => picture.productId === item.product._id)
			})),
			totalPrice: {
				amount: parseFloat(order.totalPrice.amount.toString()),
				currency: order.totalPrice.currency
			}
		}
	};
}
