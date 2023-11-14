import { collections } from '$lib/server/database';
import type { Style } from '$lib/types/Style';
import { z } from 'zod';

export const load = async () => {
	const styles = await collections.styles
		.find()
		.project<Pick<Style, '_id' | 'name'>>({ _id: 1, name: 1 })
		.toArray();

	return {
		styles
	};
};

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const { mainTheme } = z
			.object({
				mainTheme: z.string()
			})
			.parse(Object.fromEntries(formData));

		await collections.runtimeConfig.updateOne(
			{ _id: 'mainThemeId' },
			{ $set: { data: mainTheme, updatedAt: new Date() } },
			{ upsert: true }
		);
	}
};
