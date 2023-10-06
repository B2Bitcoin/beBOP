import { collections } from '$lib/server/database';
import { ObjectId } from 'mongodb';
import type { Actions } from './$types';
import { z } from 'zod';
import { addMinutes } from 'date-fns';
import { sendResetPasswordNotification } from '$lib/server/sendResetPasswordNotification';

export const load = async () => {};

export const actions: Actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const { accountType, otherLogin } = z
			.object({
				accountType: z.string(),
				otherLogin: z.string()
			})
			.parse({
				accountType: data.get('accountType'),
				otherLogin: data.get('otherLogin')
			});
		let query = accountType === 'super-admin' ? { roleId: accountType } : { login: otherLogin };
		const user = await collections.users.findOne(query);
		if (user) {
			await collections.passwordResets.insertOne({
				_id: new ObjectId(),
				userId: user._id,
				tokenUrl: new ObjectId().toString(),
				expiresAt: addMinutes(new Date(), 15),
				createdAt: new Date(),
				updatedAt: new Date()
			});
			sendResetPasswordNotification(user);
			return { success: true };
		} else {
			return { failedFindUser: true, accountType, otherLogin };
		}
	}
};
