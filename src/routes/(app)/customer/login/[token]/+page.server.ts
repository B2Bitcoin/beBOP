import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

import type { SetRequired } from 'type-fest';
import type { Session } from '$lib/types/session';

export async function load({ params }) {
	const session = await collections.sessions.findOne<SetRequired<Session, 'authLink'>>({
		'authLink.token': params.token
	});

	if (!session) {
		throw error(404, 'token authentification not found');
	}

	if (session.authLink.expiresAt < new Date()) {
		throw error(404, 'token authentification has expired');
	}

	return { session: { email: session.email, npub: session.npub } };
}
