import { collections } from '$lib/server/database';
import { countryFromIp } from '$lib/server/geoip';
import { getConfirmationBlocks } from '$lib/server/getConfirmationBlocks';
import { pojo } from '$lib/server/pojo';
import { sum } from '$lib/utils/sum';
import { toSatoshis } from '$lib/utils/toSatoshis';

export async function load() {
	const orders = await collections.orders.find().sort({ createdAt: -1 }).toArray();

	return {
		orders: orders.map((order) => ({
			_id: order._id,
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
				invoiceId: payment.invoiceId,
				transactions: payment.transactions,
				currencySnapshot: payment.currencySnapshot,
				confirmationBlocksRequired:
					payment.method === 'bitcoin'
						? getConfirmationBlocks(toSatoshis(payment.price.amount, payment.price.currency))
						: 0,
				...(payment.bankTransferNumber && { bankTransferNumber: payment.bankTransferNumber }),
				...(payment.detail && { detail: payment.detail })
			})),
			number: order.number,
			createdAt: order.createdAt,
			currencySnapshot: order.currencySnapshot,
			status: order.status,
			items: order.items.map((item) => ({
				...item,
				product: {
					...item.product,
					vatProfileId: item.product.vatProfileId?.toString()
				}
			})),
			quantityOrder: sum(order.items.map((items) => items.quantity)),
			billingAddress: order.billingAddress,
			shippingAddress: order.shippingAddress,
			ipCountry: countryFromIp(order.clientIp ?? '')
		}))
	};
}
