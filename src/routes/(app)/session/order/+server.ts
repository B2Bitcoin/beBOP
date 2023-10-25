import { collections } from '$lib/server/database.js';

export async function GET({ locals }) {
	const order = await collections.orders.findOne(
		{ 'user.userId': locals.user?._id },
		{ sort: { createdAt: -1 } }
	);

	return new Response(JSON.stringify(order), {
		headers: { 'Content-Type': 'application/json' }
	});
}
