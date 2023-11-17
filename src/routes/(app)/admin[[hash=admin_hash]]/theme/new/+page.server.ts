import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { set } from 'lodash-es';
import { collections } from '$lib/server/database';
import { adminPrefix } from '$lib/server/admin';
import type { Theme } from '$lib/types/Theme';
import type { Timestamps } from '$lib/types/Timestamps';
import { themeValidator } from '$lib/server/theme';

export async function load() {}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const json = {};

		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const theme = themeValidator.parse(json) satisfies Omit<Theme, '_id' | keyof Timestamps>;

		await collections.themes.insertOne({
			...theme,
			createdAt: new Date(),
			updatedAt: new Date(),
			_id: crypto.randomUUID()
		});

		throw redirect(303, `${adminPrefix()}/theme`);
	}
};
