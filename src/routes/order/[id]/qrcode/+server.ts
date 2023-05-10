import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';
import qrcode from 'qrcode';

export async function GET({ params }) {
	const order = await collections.orders.findOne({ _id: params.id });

	if (!order) {
		throw error(404, 'Order not found');
	}

	const address = `bitcoin:${order.payment.address}?amount=${order.totalPrice.amount.toString()}`;

	return new Response(await qrcode.toString(address, { type: 'svg' }), {
		headers: { 'content-type': 'image/svg+xml' },
		status: 200
	});
}
