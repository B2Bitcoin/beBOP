import { collections } from '$lib/server/database';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { addSeconds, addYears } from 'date-fns';
import { runtimeConfig } from '$lib/server/runtime-config';
import { createSuperAdminUserInDb } from '$lib/server/user.js';
import { CUSTOMER_ROLE_ID, POS_ROLE_ID } from '$lib/types/User.js';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, locals.user.role === POS_ROLE_ID ? '/pos' : `/admin`);
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
		let user = await collections.users.findOne({ login: login, roleId: { $ne: CUSTOMER_ROLE_ID } });

		if (!user && !runtimeConfig.isAdminCreated) {
			await createSuperAdminUserInDb(login, password);

			user = await collections.users.findOne({ login: login });
		}

		if (!user) {
			return fail(400, { login, incorrect: 'login' });
		}

		if (!user.password || !(await bcryptjs.compare(password, user.password))) {
			return fail(400, { login, incorrect: 'password' });
		}

		await collections.users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
		await collections.sessions.updateOne(
			{
				sessionId: locals.sessionId
			},
			{
				$set: {
					userId: user._id,
					expiresAt: addYears(new Date(), 1),
					expireUserAt: addSeconds(new Date(), remember ? memorize : 3600)
				},
				$setOnInsert: {
					createdAt: new Date(),
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);
		// Redirect to the admin dashboard upon successful login
		throw redirect(303, user.roleId === POS_ROLE_ID ? '/pos' : `/admin`);
	}
};
