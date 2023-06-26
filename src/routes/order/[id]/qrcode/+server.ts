import { collections } from '$lib/server/database.js';
import { toBitcoins } from '$lib/utils/toBitcoins.js';
import { error } from '@sveltejs/kit';
import qrcode from 'qrcode';

export async function GET({ params }) {
	const order = await collections.orders.findOne({ _id: params.id });

	if (!order) {
		throw error(404, 'Order not found');
	}

	if (order.payment.method !== 'bitcoin' && order.payment.method !== 'lightning') {
		throw error(400, 'Invalid payment method for QR Code generation');
	}

	if (!order.payment.address) {
		throw error(400, 'Payment address not found');
	}

	const address =
		order.payment.method === 'bitcoin'
			? `bitcoin:${order.payment.address}?amount=${toBitcoins(
					order.totalPrice.amount,
					order.totalPrice.currency
			  )
					.toLocaleString('en-US', { maximumFractionDigits: 8 })
					.replaceAll(',', '')}`
			: order.payment.address;

	return new Response(await qrcode.toString(address, { type: 'svg' }), {
		headers: { 'content-type': 'image/svg+xml' },
		status: 200
	});
}
