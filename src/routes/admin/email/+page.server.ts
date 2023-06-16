import { sendEmail } from '$lib/server/email.js';
import { z } from 'zod';

export const actions = {
	default: async function ({ request }) {
		const { to, subject, body } = z
			.object({
				to: z.string().email(),
				subject: z.string(),
				body: z.string()
			})
			.parse(Object.fromEntries(await request.formData()));

		await sendEmail({ to, subject, html: body });

		return {
			success: true
		};
	}
};
