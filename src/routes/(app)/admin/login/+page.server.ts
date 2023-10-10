import { collections } from '$lib/server/database';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { addSeconds } from 'date-fns';

export const load = async () => {};

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
		const authenticateUser = await collections.users.findOne({ login: login });
		if (authenticateUser && (await bcryptjs.compare(password, authenticateUser.password!))) {
			await collections.users.updateOne(
				{ _id: authenticateUser._id },
				{ $set: { lastLoginAt: new Date() } }
			);
			await collections.sessions.deleteOne({ sessionId: locals.sessionId });
			await collections.sessions.insertOne({
				_id: new ObjectId(),
				userId: authenticateUser._id,
				sessionId: locals.sessionId,
				expiresAt: addSeconds(new Date(), remember ? memorize : 3600),
				createdAt: new Date(),
				updatedAt: new Date()
			});
			// Redirect to the admin dashboard upon successful login
			throw redirect(303, `/admin`);
		} else {
			// Login failed, you can redirect to a login error page or handle it as needed
			return fail(400, { login, incorrect: true });
		}
	}
};
