import { z } from 'zod';

export const actions = {
	default: async function ({ locals, request }) {
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

		console.log('login, password ', login, password);
	}
};
