import { formatCart } from '$lib/server/cart.js';
import { collections } from '$lib/server/database.js';

export async function GET({ url }) {
	const sessionId = url.searchParams.get('sessionId');

	const cart = await collections.carts.findOne({ sessionId: sessionId });

	const formattedCart = await formatCart(cart);

	return new Response(JSON.stringify(formattedCart), {
		headers: { 'Content-Type': 'application/json' }
	});
}
