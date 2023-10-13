import { collections } from '$lib/server/database';
import { z } from 'zod';
import { addMinutes } from 'date-fns';
import { sendResetPasswordNotification } from '$lib/server/sendNotification';

export const load = async () => {};

export const actions = {
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
		const query = accountType === 'super-admin' ? { roleId: accountType } : { login: otherLogin };
		const user = await collections.users.findOne(query);
		if (user) {
			await collections.users.updateOne(
				{ _id: user._id },
				{
					$set: {
						passwordReset: {
							token: crypto.randomUUID(),
							expiresAt: addMinutes(new Date(), 15)
						}
					}
				}
			);
			const userUpdated = await collections.users.findOne(query);
			if (userUpdated) {
				await sendResetPasswordNotification(userUpdated);
			}
			return { success: true };
		} else {
			return { failedFindUser: true, accountType, otherLogin };
		}
	}
};
