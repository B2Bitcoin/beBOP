import { S3_BUCKET } from '$env/static/private';
import { collections } from '$lib/server/database.js';
import { s3client } from '$lib/server/s3.js';
import type { Picture } from '$lib/types/Picture.js';
import { UrlDependency } from '$lib/types/UrlDependency.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

	const digitalFiles = await collections.digitalFiles
		.find({ productId: { $in: order.items.map((item) => item.product._id) } })
		.toArray();

	return {
		order: {
			number: order.number,
			createdAt: order.createdAt,
			payment: {
				method: order.payment.method,
				status: order.payment.status,
				address: order.payment.address,
				expiresAt: order.payment.expiresAt
			},
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
		},

		digitalFiles: await Promise.all(
			digitalFiles.map(async (file) => ({
				name: file.name,
				size: file.storage.size,
				link:
					order.payment.status === 'paid'
						? await getSignedUrl(
								s3client,
								new GetObjectCommand({
									Bucket: S3_BUCKET,
									Key: file.storage.key
								}),
								{ expiresIn: 24 * 3600 }
						  )
						: undefined
			}))
		)
	};
}
