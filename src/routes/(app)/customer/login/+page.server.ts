import { collections } from '$lib/server/database';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { addSeconds } from 'date-fns';
import { generateId } from '$lib/utils/generateId';
import { sendResetPasswordNotification } from '$lib/server/sendNotification';

export const load = async () => {};

export const actions = {
	default: async function ({ locals, request }) {
		const data = await request.formData();

		const { login } = z
			.object({
				login: z.string()
			})
			.parse({
				login: data.get('login')
			});

		const user = await collections.users.insertOne({
			_id: generateId(login, true),
			login: login,
			backupInfo: { nostr: login },
			roleId: 'customer',
			status: 'active',
			token: crypto.randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date()
		});
		if (user) {
			sendResetPasswordNotification;
			return { login, success: true };
		} else {
			return fail(400, { fail: true });
		}
	}
};
