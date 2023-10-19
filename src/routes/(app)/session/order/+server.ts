import { formatCart } from '$lib/server/cart.js';
import { collections } from '$lib/server/database.js';

export async function GET({ url }) {
	const sessionId = url.searchParams.get('sessionId');

	const order = await collections.orders.findOne({ sessionId: sessionId });

	console.log('ORDER ', order);

	return new Response(JSON.stringify(order), {
		headers: { 'Content-Type': 'application/json' }
	});
}
