import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database';
import { toBitcoins } from '$lib/utils/toBitcoins';
import { error } from '@sveltejs/kit';
import qrcode from 'qrcode';

export async function GET({ params }) {
	const order = await collections.orders.findOne({ _id: params.id });

	if (!order) {
		throw error(404, 'Order not found');
	}

	if (
		order.payment.method !== 'bitcoin' &&
		order.payment.method !== 'lightning' &&
		order.payment.method !== 'card'
	) {
		throw error(400, 'Invalid payment method for QR Code generation');
	}

	let address = order.payment.address;

	if (order.payment.method === 'card') {
		address = `${ORIGIN}/order/${order._id}/pay`;
	}

	if (!address) {
		throw error(400, 'Payment address not found');
	}

	address =
		order.payment.method === 'bitcoin'
			? `bitcoin:${order.payment.address}?amount=${toBitcoins(
					order.totalPrice.amount,
					order.totalPrice.currency
			  )
					.toLocaleString('en-US', { maximumFractionDigits: 8 })
					.replaceAll(',', '')}`
			: address;

	return new Response(await qrcode.toString(address, { type: 'svg' }), {
		headers: { 'content-type': 'image/svg+xml' },
		status: 200
	});
}
