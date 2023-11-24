import { collections } from '$lib/server/database';
import { picturesForProducts } from '$lib/server/picture';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { getS3DownloadLink } from '$lib/server/s3';
import { isSumupEnabled } from '$lib/server/sumup.js';
import { UrlDependency } from '$lib/types/UrlDependency';
import { getConfirmationBlocks } from '$lib/utils/getConfirmationBlocks.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, depends }) {
	const order = await collections.orders.findOne({
		_id: params.id
	});

	if (!order) {
		throw error(404, 'Order not found');
	}

	depends(UrlDependency.Order);

	const pictures = await picturesForProducts(order.items.map((item) => item.product._id));

	const digitalFiles = await collections.digitalFiles
		.find({ productId: { $in: order.items.map((item) => item.product._id) } })
		.toArray();

	if (order.payment.method === 'card' && order.payment.status === 'pending' && isSumupEnabled()) {
		const response = await fetch(
			'https://api.sumup.com/v0.1/checkouts/' + order.payment.checkoutId,
			{
				headers: {
					Authorization: 'Bearer ' + runtimeConfig.sumUp.apiKey
				}
			}
		);

		if (!response.ok) {
			throw new Error('Failed to fetch checkout status');
		}

		const checkout = await response.json();

		if (checkout.status === 'PAID') {
			order.payment.status = 'paid';

			// order-lock will take care of updating in background
		}
	}

	return {
		confirmationBlocksRequired: getConfirmationBlocks(order.totalPrice.amount),
		order: {
			_id: order._id,
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
					availableDate: item.product.availableDate,
					shipping: item.product.shipping
				},
				...(item.customPrice && { customPrice: item.customPrice }),
				picture: pictures.find((picture) => picture.productId === item.product._id),
				digitalFiles: digitalFiles.filter(
					(digitalFile) => digitalFile.productId === item.product._id
				)
			})),
			totalPrice: {
				amount: order.totalPrice.amount,
				currency: order.totalPrice.currency
			},
			shippingPrice: order.shippingPrice && {
				amount: order.shippingPrice.amount,
				currency: order.shippingPrice.currency
			},
			vat: order.vat && {
				country: order.vat.country,
				price: {
					amount: order.vat.price.amount,
					currency: order.vat.price.currency
				},
				rate: order.vat.rate
			},
			shippingAddress: order.shippingAddress,
			notifications: order.notifications,
			vatFree: order.vatFree,
			discount: order.discount,
			amountsInOtherCurrencies: order.amountsInOtherCurrencies
		},

		digitalFiles: await Promise.all(
			digitalFiles.map(async (file) => ({
				name: file.name,
				size: file.storage.size,
				link:
					order.payment.status === 'paid' ? await getS3DownloadLink(file.storage.key) : undefined
			}))
		)
	};
}

export const actions = {
	cancel: async function ({ params, request }) {
		await collections.orders.updateOne(
			{
				_id: params.id,
				'payment.status': 'pending'
			},
			{
				$set: {
					'payment.status': 'canceled'
				}
			}
		);

		throw redirect(303, request.headers.get('referer') || '/');
	}
};
