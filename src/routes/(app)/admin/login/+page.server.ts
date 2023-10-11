import { collections, withTransaction } from '$lib/server/database';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { addSeconds } from 'date-fns';
import { runtimeConfig } from '$lib/server/runtime-config';
import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, `/admin`);
	}
	return {
		isAdminCreated: runtimeConfig.isAdminCreated
	};
};

export const actions = {
	default: async function ({ locals, request }) {
		const data = await request.formData();

		const { login, password, remember, memorize } = z
			.object({
				login: z.string(),
				password: z.string(),
				remember: z.boolean({ coerce: true }).default(false),
				memorize: z.number({ coerce: true }).int()
			})
			.parse({
				login: data.get('login'),
				password: data.get('password'),
				remember: data.get('remember'),
				memorize: data.get('memorize')
			});
		let user = await collections.users.findOne({ login: login });

		if (!user && !runtimeConfig.isAdminCreated) {
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

			user = newUser;
		}

		if (!user) {
			return fail(400, { login, incorrect: 'login' });
		}

		if (!(await bcryptjs.compare(password, user.password))) {
			return fail(400, { login, incorrect: 'password' });
		}

		await collections.users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
		await collections.sessions.insertOne({
			_id: new ObjectId(),
			userId: user._id,
			sessionId: locals.sessionId,
			expiresAt: addSeconds(new Date(), remember ? memorize : 3600),
			createdAt: new Date(),
			updatedAt: new Date()
		});
		// Redirect to the admin dashboard upon successful login
		throw redirect(303, `/admin`);
	}
};
