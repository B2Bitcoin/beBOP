import { collections } from '$lib/server/database.js';
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

	const address =
		order.payment.method === 'bitcoin'
			? `bitcoin:${order.payment.address}?amount=${order.totalPrice.amount.toString()}`
			: order.payment.address;

	return new Response(await qrcode.toString(address, { type: 'svg' }), {
		headers: { 'content-type': 'image/svg+xml' },
		status: 200
	});
}
