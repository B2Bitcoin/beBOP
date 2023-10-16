import { z } from 'zod';
import { collections } from '$lib/server/database';
import bcryptjs from 'bcryptjs';
import { redirect } from '@sveltejs/kit';

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

		await collections.seats.insertOne({
			_id: crypto.randomUUID(),
			login,
			password: passwordBcrypt,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, '/admin/pos');
	}
};
