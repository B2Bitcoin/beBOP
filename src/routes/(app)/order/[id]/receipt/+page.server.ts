import { error } from '@sveltejs/kit';
import { fetchOrderForUser } from '../fetchOrderForUser.js';
import { runtimeConfig } from '$lib/server/runtime-config.js';

export async function load({ params }) {
	const order = await fetchOrderForUser(params.id);
	if (!order) {
		throw error(404, 'Order not found');
	}
	if (order.payment.status !== 'paid') {
		throw error(400, 'Order is not paid');
	}
	if (!runtimeConfig.sellerIdentity || !order.sellerIdentity) {
		throw error(400, 'Seller identity is not set');
	}
	return {
		order,
		layoutReset: true,
		sellerIdentity: order.sellerIdentity || runtimeConfig.sellerIdentity
	};
}
