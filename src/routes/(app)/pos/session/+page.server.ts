import { collections } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
import { formatCart, formatOrder } from './formatCartOrder.js';
import { runtimeConfig } from '$lib/server/runtime-config.js';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	const cart = await collections.carts.findOne(
		{ 'user.userId': locals.user._id },
		{ sort: { createdAt: -1 } }
	);

	const order = await collections.orders.findOne(
		{ 'user.userId': locals.user._id },
		{ sort: { createdAt: -1 } }
	);

	const formattedCart = await formatCart(cart, locals);

	return {
		cart: formattedCart,
		order: order && formatOrder(order),
		layoutReset: true,
		removeBebopLogoPOS: runtimeConfig.removeBebopLogoPOS
	};
};
