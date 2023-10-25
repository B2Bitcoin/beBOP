import { z } from 'zod';
import { collections } from '$lib/server/database';
import bcryptjs from 'bcryptjs';
import { redirect } from '@sveltejs/kit';
import { POS_ROLE_ID } from '$lib/types/User.js';
import { ObjectId } from 'mongodb';

export const actions = {
	default: async function ({ request }) {
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

		const salt = await bcryptjs.genSalt(10);
		const passwordBcrypt = await bcryptjs.hash(password, salt);

		await collections.users.insertOne({
			_id: new ObjectId(),
			login,
			password: passwordBcrypt,
			createdAt: new Date(),
			updatedAt: new Date(),
			roleId: POS_ROLE_ID
		});

		throw redirect(303, '/admin/pos');
	}
};
