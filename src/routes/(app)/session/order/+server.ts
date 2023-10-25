import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';

export async function GET({ locals }) {
	if (!locals.user?._id) {
		throw error(401, 'Not authorized');
	}

	const order = await collections.orders.findOne(
		{ 'user.userId': locals.user?._id },
		{ sort: { createdAt: -1 } }
	);

	return new Response(JSON.stringify(order), {
		headers: { 'Content-Type': 'application/json' }
	});
}
