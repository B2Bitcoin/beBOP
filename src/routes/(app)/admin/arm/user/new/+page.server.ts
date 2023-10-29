import { z } from 'zod';
import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
import { ObjectId } from 'mongodb';
import { zodNpub } from '$lib/server/nostr.js';
import { sendResetPasswordNotification } from '$lib/server/sendNotification.js';

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();
		const allowedRoles = (await collections.roles.find().toArray()).filter(
			(role) => role._id !== SUPER_ADMIN_ROLE_ID
		);

		const { login, email, npub, roleId } = z
			.object({
				login: z.string(),
				email: z.string().email().optional(),
				npub: zodNpub().optional(),
				roleId: z.enum([allowedRoles[0]._id, ...allowedRoles.map((role) => role._id)])
			})
			.parse(Object.fromEntries(data));

		if (!email && !npub) {
			throw error(400, 'You must provide a recovery email or npub');
		}

		const user = {
			_id: new ObjectId(),
			login,
			recovery: {
				...(email && { email }),
				...(npub && { npub })
			},
			createdAt: new Date(),
			updatedAt: new Date(),
			roleId
		};

		await collections.users.insertOne(user);

		await sendResetPasswordNotification(user);

		throw redirect(303, '/admin/arm');
	}
};
