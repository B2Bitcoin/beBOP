import { collections } from '$lib/server/database';
import { picturesForProducts } from '$lib/server/picture';
import { runtimeConfig } from '$lib/server/runtime-config';
import { isSumupEnabled } from '$lib/server/sumup';
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
		_id: order._id,
		number: order.number,
		createdAt: order.createdAt,
		payment: {
			method: order.payment.method,
			status: order.payment.status,
			address: order.payment.address,
			expiresAt: order.payment.expiresAt,
			checkoutId: order.payment.checkoutId
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
			),
			amountsInOtherCurrencies: item.amountsInOtherCurrencies
		})),
		totalPrice: {
			amount: order.totalPrice.amount,
			currency: order.totalPrice.currency
		},
		shippingPrice: order.shippingPrice && {
			amount: order.shippingPrice.amount,
			currency: order.shippingPrice.currency
		},
		invoiceNumber: order.invoiceNumber,
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
	};
}
