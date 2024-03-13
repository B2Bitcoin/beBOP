import { error } from '@sveltejs/kit';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { fetchOrderForUser } from '../fetchOrderForUser';

export async function load({ params }) {
	const order = await fetchOrderForUser(params.id);
	if (!order) {
		throw error(404, 'Order not found');
	}

	if (!runtimeConfig.sellerIdentity && !order.sellerIdentity) {
		throw error(400, 'Seller identity is not set');
	}
	return {
		order,
		layoutReset: true,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		sellerIdentity: (order.sellerIdentity || runtimeConfig.sellerIdentity)!
	};
}
