import { collections } from '$lib/server/database.js';
import { zodNpub } from '$lib/server/nostr.js';
import { sendResetPasswordNotification } from '$lib/server/sendNotification.js';
import { CUSTOMER_ROLE_ID, SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
import { error, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const actions = {
	update: async function ({ params, request }) {
		const user = await collections.users.findOne({ _id: new ObjectId(params.id) });

		if (!user) {
			throw error(404, 'User not found');
		}

		if (user.roleId === SUPER_ADMIN_ROLE_ID) {
			throw error(403, 'You cannot update a super admin');
		}

		if (user.roleId === CUSTOMER_ROLE_ID) {
			throw error(403, 'You cannot update a customer from here');
		}

		const allowedRoles = (await collections.roles.find().toArray()).filter(
			(role) => role._id !== SUPER_ADMIN_ROLE_ID
		);

		const data = await request.formData();

		const parsed = z
			.object({
				login: z.string(),
				recoveryEmail: z.string().email().optional(),
				recoveryNpub: zodNpub().optional(),
				status: z.enum(['enabled', 'disabled']),
				roleId: z.enum([allowedRoles[0]._id, ...allowedRoles.map((role) => role._id)])
			})
			.parse(Object.fromEntries(data));

		if (!parsed.recoveryEmail && !parsed.recoveryNpub) {
			throw error(400, 'You must provide a recovery email or npub');
		}

		await collections.users.updateOne(
			{ _id: user._id },
			{
				$set: {
					login: parsed.login,
					recovery: {
						...(parsed.recoveryEmail && { email: parsed.recoveryEmail }),
						...(parsed.recoveryNpub && { npub: parsed.recoveryNpub })
					},
					disabled: parsed.status === 'disabled',
					roleId: parsed.roleId
				}
			}
		);

		throw redirect(303, '/admin/arm');
	},
	resetPassword: async function ({ params }) {
		const user = await collections.users.findOne({ _id: new ObjectId(params.id) });

		if (!user) {
			throw error(404, 'User not found');
		}

		if (user.roleId === SUPER_ADMIN_ROLE_ID) {
			throw error(
				403,
				'You cannot reset the password of a super admin. If you are the super admin, go to /admin/login/recovery'
			);
		}

		if (user.roleId === CUSTOMER_ROLE_ID) {
			throw error(
				403,
				'You cannot reset the password of a customer from here. If you are the customer, go to /customer/login/recovery'
			);
		}

		if (!user.recovery?.email && !user.recovery?.npub) {
			throw error(403, 'This user has no recovery email or npub, set those first');
		}

		await collections.users.updateOne(
			{ _id: user._id },
			{
				$unset: {
					password: ''
				}
			}
		);

		await sendResetPasswordNotification(user);

		throw redirect(303, '/admin/arm');
	},
	delete: async function ({ params }) {
		const user = await collections.users.findOne({ _id: new ObjectId(params.id) });

		if (!user) {
			throw error(404, 'User not found');
		}

		if (user.roleId === SUPER_ADMIN_ROLE_ID) {
			throw error(403, 'You cannot delete a super admin');
		}

		if (user.roleId === CUSTOMER_ROLE_ID) {
			throw error(403, 'You cannot delete a customer from here');
		}

		await collections.users.deleteOne({ _id: user._id });

		throw redirect(303, '/admin/arm');
	}
};
