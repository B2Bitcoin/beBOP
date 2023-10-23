import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './[sessionId]/$types';
import { convertObjectIdsToStrings } from '$lib/utils/convertObjectIdsToStrings';
import { formatCart } from '$lib/server/cart';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await collections.users.findOne({ login: locals.user.login });

	if (!user) {
		throw error(404, 'User not found');
	}

	const cart = await collections.carts.findOne({ userId: user?._id });
	const order = await collections.orders
		.find({ userId: user?._id })
		.sort({ createdAt: -1 })
		.limit(1)
		.next();

	const sanitizedCart = convertObjectIdsToStrings(cart);
	const sanitizedOrder = convertObjectIdsToStrings(order);
	const formattedCart = await formatCart(sanitizedCart);

	return {
		cart: formattedCart,
		order: sanitizedOrder,
		userId: user._id.toString()
	};
};
