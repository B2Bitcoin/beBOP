import { z } from 'zod';
import { collections } from '$lib/server/database';
import bcryptjs from 'bcryptjs';
import { redirect } from '@sveltejs/kit';
import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
import { ObjectId } from 'mongodb';
import { BCRYPT_SALT_ROUNDS } from '$lib/server/user.js';
import { roles } from '$lib/server/role.js';

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();
		const allowedRoles = (await roles()).filter((role) => role._id !== SUPER_ADMIN_ROLE_ID);

		const { login, password, roleId } = z
			.object({
				login: z.string(),
				password: z.string(),
				roleId: z.enum([allowedRoles[0]._id, ...allowedRoles.map((role) => role._id)])
			})
			.parse(Object.fromEntries(data));

		const passwordBcrypt = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);

		await collections.users.insertOne({
			_id: new ObjectId(),
			login,
			password: passwordBcrypt,
			createdAt: new Date(),
			updatedAt: new Date(),
			roleId
		});

		throw redirect(303, '/admin/arm');
	}
};
