import { collections } from '$lib/server/database';
import { z } from 'zod';
import { sendResetPasswordNotification } from '$lib/server/sendNotification';
import { CUSTOMER_ROLE_ID } from '$lib/types/User';

export const load = async () => {};

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const { accountType, login } = z
			.object({
				accountType: z.string(),
				login: z.string()
			})
			.parse(Object.fromEntries(data));

		const user = await collections.users.findOne({ login, roleId: { $ne: CUSTOMER_ROLE_ID } });
		if (user) {
			await sendResetPasswordNotification(user);
			return { success: true };
		} else {
			return { failedFindUser: true, accountType, login };
		}
	}
};
