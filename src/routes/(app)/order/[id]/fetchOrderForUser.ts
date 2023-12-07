import { collections } from '$lib/server/database';
import { getConfirmationBlocks } from '$lib/server/getConfirmationBlocks';
import { picturesForProducts } from '$lib/server/picture';
import { runtimeConfig } from '$lib/server/runtime-config';
import { isSumupEnabled } from '$lib/server/sumup';
import { toSatoshis } from '$lib/utils/toSatoshis';
import { error } from '@sveltejs/kit';

export async function fetchOrderForUser(orderId: string) {
	const order = await collections.orders.findOne({
		_id: orderId
	});

	if (!order) {
		throw error(404, 'Order not found');
	}

	const pictures = await picturesForProducts(order.items.map((item) => item.product._id));

	const digitalFiles = await collections.digitalFiles
		.find({ productId: { $in: order.items.map((item) => item.product._id) } })
		.toArray();

	for (const payment of order.payments) {
		if (
			payment.method === 'card' &&
			payment.status === 'pending' &&
			isSumupEnabled() &&
			payment.checkoutId
		) {
			const response = await fetch('https://api.sumup.com/v0.1/checkouts/' + payment.checkoutId, {
				headers: {
					Authorization: 'Bearer ' + runtimeConfig.sumUp.apiKey
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch checkout status');
			}

			const checkout = await response.json();

			if (checkout.status === 'PAID') {
				payment.status = 'paid';

				if (
					order.payments.every((payment) => payment.status === 'paid') &&
					order.status === 'pending'
				) {
					order.status = 'paid';
				}

				// order-lock will take care of updating in background
			}
		}
	}

	return {
		_id: order._id,
		number: order.number,
		createdAt: order.createdAt,
		payments: order.payments.map((payment) => ({
			id: payment._id.toString(),
			method: payment.method,
			status: payment.status,
			address: payment.address,
			expiresAt: payment.expiresAt,
			checkoutId: payment.checkoutId,
			invoice: payment.invoice,
			price: payment.price,
			currencySnapshot: payment.currencySnapshot,
			confirmationBlocksRequired:
				payment.method === 'bitcoin'
					? getConfirmationBlocks(toSatoshis(payment.price.amount, payment.price.currency))
					: 0
		})),
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
			),
			currencySnapshot: item.currencySnapshot
		})),
		shippingPrice: order.shippingPrice && {
			amount: order.shippingPrice.amount,
			currency: order.shippingPrice.currency
		},
		sellerIdentity: order.sellerIdentity,
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
		currencySnapshot: order.currencySnapshot,
		status: order.status
	};
}
