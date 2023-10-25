import { formatCart } from '$lib/server/cart.js';
import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export async function GET({ url }) {
	const userId = url.searchParams.get('userId');

	if (!userId) {
		throw error(400, 'userId not provided');
	}

	const cart = await collections.carts.findOne(
		{ 'user.userId': new ObjectId(userId) },
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
