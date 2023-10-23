import { ObjectId } from 'mongodb';
import { runtimeConfig } from './runtime-config';

import bcryptjs from 'bcryptjs';
import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User';
import { collections, withTransaction } from './database';
import type { UserIdentifier } from '$lib/types/UserIdentifier';

export async function createAdminUserInDb(login: string, password: string) {
	if (runtimeConfig.isAdminCreated) {
		return;
	}

	const salt = await bcryptjs.genSalt(10);
	const passwordBcrypt = await bcryptjs.hash(password, salt);

	// Create super admin
	const newUser = {
		_id: new ObjectId(),
		login,
		password: passwordBcrypt,
		createdAt: new Date(),
		updatedAt: new Date(),
		roleId: SUPER_ADMIN_ROLE_ID
	};

	await withTransaction(async (session) => {
		await collections.users.insertOne(newUser, { session });
		await collections.runtimeConfig.updateOne(
			{
				_id: 'isAdminCreated'
			},
			{
				$set: {
					data: true,
					updatedAt: new Date()
				}
			},
			{ session, upsert: true }
		);
		runtimeConfig.isAdminCreated = true;
	});
}

export function userIdentifier(locals: App.Locals): UserIdentifier {
	return {
		ssoIds: locals.sso?.map((sso) => sso.id),
		userId: locals.user?._id,
		email: locals.email,
		npub: locals.npub,
		sessionId: locals.sessionId
	};
}

export function userQuery(user: UserIdentifier) {
	return {
		$or: Object.entries(user)
			.filter(([, v]) => v)
			.map(([key, value]) => ({ ['user.' + key]: value }))
	};
}
