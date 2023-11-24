import { collections } from '$lib/server/database.js';
import { UrlDependency } from '$lib/types/UrlDependency.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, depends }) {
	const order = await collections.orders.findOne({
		_id: params.id
	});

	if (!order) {
		throw error(404, 'Order not found');
	}

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
		checkoutId: order.payment.checkoutId
	};
}
