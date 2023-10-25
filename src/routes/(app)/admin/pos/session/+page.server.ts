import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { formatCart } from '$lib/server/cart';

export const load = async ({ locals }) => {
	const user = await collections.users.findOne({ login: locals.user?.login });

	if (!user) {
		throw error(404, 'User not found');
	}

	const cart = await collections.carts.findOne(
		{ 'user.userId': user?._id },
		{ sort: { createdAt: -1 } }
	);

	const order = await collections.orders.findOne(
		{ 'user.userId': user?._id },
		{ sort: { createdAt: -1 } }
	);

	const formattedCart = await formatCart(cart);

	return {
		cart: formattedCart,
		order: {
			...order,
			user: null
		},
		userId: user._id.toString()
	};
};
