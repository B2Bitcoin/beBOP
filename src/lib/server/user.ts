import { ObjectId } from 'mongodb';
import { runtimeConfig } from './runtime-config';

import bcryptjs from 'bcryptjs';
import { MIN_PASSWORD_LENGTH, SUPER_ADMIN_ROLE_ID } from '$lib/types/User';
import { collections, withTransaction } from './database';
import type { UserIdentifier } from '$lib/types/UserIdentifier';
import { error } from '@sveltejs/kit';

export const BCRYPT_SALT_ROUNDS = 10;

export async function createSuperAdminUserInDb(login: string, password: string) {
	if (runtimeConfig.isAdminCreated) {
		return;
	}

	if (password.length < MIN_PASSWORD_LENGTH) {
		throw error(400, 'Password too short');
	}

	const passwordBcrypt = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);

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
		sessionId: locals.sessionId,

		userLogin: locals.user?.login,
		userRoleId: locals.user?.roleId
	};
}

export function userQuery(user: UserIdentifier) {
	const ret = {
		$or: [
			...(user.userId ? [{ 'user.userId': user.userId }] : []),
			...(user.email ? [{ 'user.email': user.email }] : []),
			...(user.npub ? [{ 'user.npub': user.npub }] : []),
			...(user.sessionId ? [{ 'user.sessionId': user.sessionId }] : []),
			...(user.ssoIds?.length ? [{ 'user.ssoIds': { $in: user.ssoIds } }] : [])
		]
	};

	if (!ret.$or.length) {
		// throw new TypeError('No identifier provided');
		return { 'user.never': 'never' };
	}

	return ret;
}
