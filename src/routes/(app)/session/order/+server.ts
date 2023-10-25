import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export async function GET({ url }) {
	const userId = url.searchParams.get('userId');

	if (!userId) {
		throw error(400, 'userId not provided');
	}

	const order = await collections.orders.findOne(
		{ 'user.userId': new ObjectId(userId) },
		{ sort: { createdAt: -1 } }
	);

	return new Response(JSON.stringify(order), {
		headers: { 'Content-Type': 'application/json' }
	});
}
