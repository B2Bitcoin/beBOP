import { collections } from '$lib/server/database';
import { bitcoinPaymentQrCodeString } from '$lib/utils/bitcoinPaymentQr';
import { error } from '@sveltejs/kit';
import qrcode from 'qrcode';

export async function GET({ params }) {
	const order = await collections.orders.findOne({ _id: params.id });

	if (!order) {
		throw error(404, 'Order not found');
	}

	const payment = order.payments.find((payment) => payment._id.equals(params.paymentId));
	if (!payment) {
		throw error(404, 'Payment not found');
	}

	if (payment.method !== 'bitcoin' && payment.method !== 'lightning' && payment.method !== 'card') {
		throw error(400, 'Invalid payment method for QR Code generation');
	}

	if (!payment.address) {
		throw error(400, 'Payment address not found');
	}

	const address =
		payment.method === 'bitcoin'
			? bitcoinPaymentQrCodeString(payment.address, payment.price.amount, payment.price.currency)
			: payment.address;

	return new Response(await qrcode.toString(address, { type: 'svg' }), {
		headers: { 'content-type': 'image/svg+xml' },
		status: 200
	});
}
