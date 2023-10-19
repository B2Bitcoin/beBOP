import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { convertObjectIdsToStrings } from '$lib/utils/convertObjectIdsToStrings';

export const load: PageServerLoad = async ({ params }) => {
	const session = await collections.sessions.findOne({ sessionId: params.sessionId });

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
