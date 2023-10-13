import { ObjectId } from 'mongodb';
import { runtimeConfig } from './runtime-config';

import bcryptjs from 'bcryptjs';
import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User';
import { collections, withTransaction } from './database';

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
