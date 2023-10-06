import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';

export async function load({ params }) {
	const users = await collections.users.find().toArray();
	const user = users.find((us) => us.passwordReset?.token === params.token);

	if (!user) {
		throw error(404, 'token password reset not found ' + params.token);
	}
	return {
		user
	};
}

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const { login, pwd1, pwd2 } = z
			.object({
				login: z.string(),
				pwd1: z.string(),
				pwd2: z.string()
			})
			.parse({
				login: data.get('login'),
				pwd1: data.get('pwd1'),
				pwd2: data.get('pwd2')
			});
		if (pwd1 === pwd2) {
			const salt = bcryptjs.genSaltSync(10);
			const passwordBcrypt = bcryptjs.hashSync(pwd1, salt);
			await collections.users.updateOne({ login: login }, { $set: { password: passwordBcrypt } });

			return { success: true };
		} else {
			// Login failed, you can redirect to a login error page or handle it as needed
			return { failed: true };
		}
	}
};
