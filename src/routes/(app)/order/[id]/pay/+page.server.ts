import { UrlDependency } from '$lib/types/UrlDependency.js';
import { error, redirect } from '@sveltejs/kit';
import { fetchOrderForUser } from '../fetchOrderForUser.js';

export async function load({ params, depends }) {
	const order = await fetchOrderForUser(params.id);

	depends(UrlDependency.Order);

	if (order.payment.method !== 'card') {
		throw redirect(303, `/order/${order._id}`);
	}

	if (order.payment.status !== 'pending') {
		throw redirect(303, `/order/${order._id}`);
	}

	if (!order.payment.checkoutId) {
		throw error(400, 'Checkout ID not found');
	}

	return {
		order
	};
}
