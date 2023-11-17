import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { increaseThemeChangeNumber } from '$lib/server/theme.js';
import type { Theme } from '$lib/types/Theme';
import { z } from 'zod';

export const load = async () => {
	const themes = await collections.themes
		.find()
		.project<Pick<Theme, '_id' | 'name'>>({ _id: 1, name: 1 })
		.map((theme) => ({ ...theme, _id: theme._id.toString() }))
		.toArray();

	return {
		themes,
		themeId: runtimeConfig.mainThemeId
	};
};

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const { mainTheme } = z
			.object({
				mainTheme: z.enum([
					'',
					...(await collections.themes.distinct('_id')).map((id) => id.toString())
				])
			})
			.parse(Object.fromEntries(formData));

		await collections.runtimeConfig.updateOne(
			{ _id: 'mainThemeId' },
			{ $set: { data: mainTheme, updatedAt: new Date() } },
			{ upsert: true }
		);

		runtimeConfig.mainThemeId = mainTheme;

		await increaseThemeChangeNumber();
	}
};
