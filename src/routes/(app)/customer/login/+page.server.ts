import { collections } from '$lib/server/database';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { addMinutes } from 'date-fns';
import { sendAuthentificationlink } from '$lib/server/sendNotification';
import { ObjectId } from 'mongodb';

export const load = async () => {};

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();
		const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

		const { login, createUser } = z
			.object({
				login: z.string(),
				createUser: z.boolean({ coerce: true }).default(false)
			})
			.parse({
				login: data.get('login'),
				createUser: data.get('createUser')
			});
		const existUser = await collections.users.findOne({ login: login });
		if (existUser) {
			const user = await collections.users.updateOne(
				{
					login: login
				},
				{
					$set: {
						authLink: { token: crypto.randomUUID(), expiresAt: addMinutes(new Date(), 60) },
						updatedAt: new Date()
					}
				}
			);
			if (user) {
				const userUpdated = await collections.users.findOne({ login: login });
				sendAuthentificationlink(userUpdated!);
				return { login, successExistUser: true };
			} else {
				return fail(400, { fail: true });
			}
		} else {
			const user = await collections.users.insertOne({
				_id: new ObjectId().toString(),
				login: login,
				backupInfo: emailPattern.test(login)
					? {
							email: login
					  }
					: {
							nostr: login
					  },
				roleId: 'customer',
				status: 'active',
				authLink: { token: crypto.randomUUID(), expiresAt: addMinutes(new Date(), 60) },
				updatedAt: new Date(),
				createdAt: new Date()
			});
			if (user) {
				const userCreated = await collections.users.findOne({ _id: user.insertedId });
				sendAuthentificationlink(userCreated!);
				return { login, successNewUser: true };
			} else {
				return fail(400, { fail: true });
			}
		}
	}
};
