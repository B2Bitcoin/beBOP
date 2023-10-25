import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { formatCart } from '$lib/server/cart';
import { POS_ROLE_ID } from '$lib/types/User.js';

export const load = async ({ locals }) => {
	if (locals.user?.role !== POS_ROLE_ID) {
		throw error(404, 'Only for POS user');
	}

	const cart = await collections.carts.findOne(
		{ 'user.userId': locals.user?._id },
		{ sort: { createdAt: -1 } }
	);

	const order = await collections.orders.findOne(
		{ 'user.userId': locals.user?._id },
		{ sort: { createdAt: -1 } }
	);

	const formattedCart = await formatCart(cart);

	return {
		cart: formattedCart,
		order: {
			...order,
			user: null
		}
	};
};
