import { collections } from '$lib/server/database';
import { getConfirmationBlocks } from '$lib/server/getConfirmationBlocks';
import { isOrderFullyPaid } from '$lib/server/orders';
import { picturesForProducts } from '$lib/server/picture';
import { runtimeConfig } from '$lib/server/runtime-config';
import { isSumupEnabled } from '$lib/server/sumup';
import { FAKE_ORDER_INVOICE_NUMBER } from '$lib/types/Order';
import { CUSTOMER_ROLE_ID } from '$lib/types/User';
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
				},
				...{ autoSelectFamily: true }
			});

			if (!response.ok) {
				throw new Error('Failed to fetch checkout status');
			}

			const checkout = await response.json();

			if (checkout.status === 'PAID') {
				payment.status = 'paid';

				payment.invoice = {
					number: FAKE_ORDER_INVOICE_NUMBER,
					createdAt: new Date()
				};

				if (isOrderFullyPaid(order) && order.status === 'pending') {
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
			paidAt: payment.paidAt,
			createdAt: payment.createdAt,
			checkoutId: payment.checkoutId,
			invoice: payment.invoice,
			price: payment.price,
			currencySnapshot: payment.currencySnapshot,
			confirmationBlocksRequired:
				payment.method === 'bitcoin'
					? getConfirmationBlocks(toSatoshis(payment.price.amount, payment.price.currency))
					: 0,
			...(payment.bankTransferNumber && { bankTransferNumber: payment.bankTransferNumber }),
			...(payment.detail && { detail: payment.detail })
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
				shipping: item.product.shipping,
				paymentMethods: item.product.paymentMethods,
				isTicket: item.product.isTicket
			},
			vatRate: item.vatRate,
			...(item.customPrice && { customPrice: item.customPrice }),
			picture: pictures.find((picture) => picture.productId === item.product._id),
			digitalFiles: digitalFiles.filter(
				(digitalFile) => digitalFile.productId === item.product._id
			),
			currencySnapshot: item.currencySnapshot,
			depositPercentage: item.depositPercentage,
			tickets: item.tickets
		})),
		shippingPrice: order.shippingPrice && {
			amount: order.shippingPrice.amount,
			currency: order.shippingPrice.currency
		},
		sellerIdentity: order.sellerIdentity,
		vat: order.vat?.map((item) => ({
			country: item.country,
			price: {
				amount: item.price.amount,
				currency: item.price.currency
			},
			rate: item.rate
		})),
		shippingAddress: order.shippingAddress,
		billingAddress: order.billingAddress,
		notifications: order.notifications,
		vatFree: order.vatFree,
		discount: order.discount,
		currencySnapshot: order.currencySnapshot,
		status: order.status,
		notes:
			order.notes?.map((note) => ({
				content: note.content,
				createdAt: note.createdAt,
				isEmployee: note.role !== CUSTOMER_ROLE_ID,
				alias: note.userAlias
			})) || [],
		receiptNote: order.receiptNote
	};
}
