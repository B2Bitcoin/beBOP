import { collections } from '$lib/server/database';
import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import type { User } from '$lib/types/User';
import { ObjectId } from 'mongodb';
import type { SetRequired } from 'type-fest';

export async function load({ params }) {
	const user = await collections.users.findOne<SetRequired<User, 'passwordReset'>>({
		'passwordReset.token': params.token
	});

	if (!user) {
		throw error(404, 'token password reset not found');
	}

	if (user.passwordReset?.expiresAt < new Date()) {
		throw error(404, 'token password reset has expired');
	}
	return {
		user
	};
}

export const actions = {
	default: async function ({ request, params }) {
		const data = await request.formData();
		const { user, pwd1 } = z
			.object({
				user: z.string(),
				pwd1: z.string()
			})
			.parse({
				user: data.get('idUser'),
				pwd1: data.get('pwd1')
			});

		const salt = await bcryptjs.genSalt(10);
		const passwordBcrypt = await bcryptjs.hash(pwd1, salt);
		if (
			await collections.users.updateOne(
				{ _id: new ObjectId(user), 'passwordReset.token': params.token },
				{ $set: { password: passwordBcrypt } }
			)
		) {
			return { success: true };
		} else {
			return fail(400, { failed: true });
		}
	}
};
