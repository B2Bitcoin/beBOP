import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

import type { User } from '$lib/types/User';
import { ObjectId } from 'mongodb';
import { addMinutes } from 'date-fns';

export async function load({ params, locals }) {
	const user = await collections.users.findOne<Pick<User, '_id' | 'login' | 'authLink'>>({
		'authLink.token': params.token
	});

	if (!user) {
		throw error(404, 'token authentification not found');
	}

	if (user.authLink && user.authLink?.expiresAt < new Date()) {
		throw error(404, 'token authentification has expired');
	}
	await collections.sessions.deleteOne({ sessionId: locals.sessionId });
	await collections.sessions.insertOne({
		_id: new ObjectId(),
		userId: user._id,
		sessionId: locals.sessionId,
		expiresAt: addMinutes(new Date(), 60),
		createdAt: new Date(),
		updatedAt: new Date()
	});

	return {
		user
	};
}
