import { formatCart } from '$lib/server/cart.js';
import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';

export async function GET({ locals }) {
	if (!locals.user?._id) {
		throw error(401, 'Not authorized');
	}

	const cart = await collections.carts.findOne(
		{ 'user.userId': locals.user?._id },
		{ sort: { createdAt: -1 } }
	);

	if (!cart) {
		throw error(404, 'Cart not found');
	}

	const formattedCart = await formatCart(cart);

	return new Response(JSON.stringify(formattedCart), {
		headers: { 'Content-Type': 'application/json' }
	});
}
