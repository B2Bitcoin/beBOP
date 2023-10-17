import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ObjectId } from 'mongodb';

export const load: PageServerLoad = async ({ params }) => {
	const session = await collections.sessions.findOne({ _id: new ObjectId(params.sessionId) });

	if (!session) {
		throw error(404, 'User not found');
	}

	const cart = await collections.carts.findOne({ sessionId: session.sessionId });

	const sanitizedSession = convertObjectIdsToStrings(session);
	const sanitizedCart = convertObjectIdsToStrings(cart);

	return {
		session: sanitizedSession,
		cart: sanitizedCart
	};
};

function convertObjectIdsToStrings(obj: any) {
	if (!obj) {
		return obj;
	}

	for (const key in obj) {
		if (obj[key] instanceof ObjectId) {
			obj[key] = obj[key].toString();
		} else if (typeof obj[key] === 'object') {
			convertObjectIdsToStrings(obj[key]);
		}
	}
	return obj;
}
