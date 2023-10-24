import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { formatCart } from '$lib/server/cart';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await collections.users.findOne({ login: locals.user?.login });

	if (!user) {
		throw error(404, 'User not found');
	}

	const cart = await collections.carts.findOne({ userId: user?._id });
	const order = await collections.orders
		.find({ userId: user?._id })
		.sort({ createdAt: -1 })
		.limit(1)
		.next();

	const formattedCart = await formatCart(cart);

	return {
		cart: formattedCart,
		order: {
			...order,
			userId: order?.userId.toString()
		},
		userId: user._id.toString()
	};
};
