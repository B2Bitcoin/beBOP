import { collections } from '$lib/server/database';
import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { CUSTOMER_ROLE_ID, type User } from '$lib/types/User';
import { ObjectId } from 'mongodb';
import type { SetRequired } from 'type-fest';
import { BCRYPT_SALT_ROUNDS } from '$lib/server/user.js';

export async function load({ params }) {
	const user = await collections.users.findOne<SetRequired<User, 'passwordReset'>>({
		'passwordReset.token': params.token,
		roleId: { $ne: CUSTOMER_ROLE_ID }
	});

	if (!user) {
		throw error(404, 'token password reset not found');
	}

	if (user.passwordReset?.expiresAt < new Date()) {
		throw error(404, 'token password reset has expired');
	}
	return { user: { _id: user._id.toString(), login: user.login } };
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

		const passwordBcrypt = await bcryptjs.hash(pwd1, BCRYPT_SALT_ROUNDS);
		const updateResult = await collections.users.updateOne(
			{
				_id: new ObjectId(user),
				'passwordReset.token': params.token,
				roleId: { $ne: CUSTOMER_ROLE_ID }
			},
			{ $set: { password: passwordBcrypt } }
		);
		if (updateResult.matchedCount) {
			return { success: true };
		} else {
			return fail(400, { failed: true });
		}
	}
};
