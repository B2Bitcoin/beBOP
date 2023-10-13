import { collections } from '$lib/server/database';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { addSeconds } from 'date-fns';
import { runtimeConfig } from '$lib/server/runtime-config';
import { createAdminUserInDb } from '$lib/server/user.js';

export const actions = {
	default: async function ({ locals, request }) {
		const data = await request.formData();

		const { login, password } = z
			.object({
				login: z.string(),
				password: z.string()
			})
			.parse({
				login: data.get('login'),
				password: data.get('password')
			});

		let user = await collections.users.findOne({ login: login });

		if (!user && !runtimeConfig.isAdminCreated) {
			await createAdminUserInDb(login, password);

			user = await collections.users.findOne({ login: login });
		}

		console.log('user ', user);

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
