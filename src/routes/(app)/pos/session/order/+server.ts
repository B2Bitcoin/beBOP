import { collections } from '$lib/server/database.js';
import { POS_ROLE_ID } from '$lib/types/User.js';
import { error } from '@sveltejs/kit';

export async function GET({ locals }) {
	if (!locals.user?._id) {
		throw error(401, 'Must be logged in');
	}

	if (locals.user.role !== POS_ROLE_ID) {
		throw error(403, 'Must be logged in as a POS user');
	}

	const order = await collections.orders.findOne(
		{ 'user.userId': locals.user._id },
		{ sort: { createdAt: -1 } }
	);

	return new Response(JSON.stringify(order), {
		headers: { 'Content-Type': 'application/json' }
	});
}
