import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { collections } from '$lib/server/database';
import { adminPrefix } from '$lib/server/admin';

export async function load({ params }) {
	const theme = await collections.themes.findOne({ _id: params.id });

	if (!theme) {
		throw redirect(303, `${adminPrefix}/style`);
	}

	return {
		theme
	};
}

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			set(json, key, value);
		}
		await collections.themes.updateOne(
			{ _id: params.id },
			{
				$set: json
			}
		);

		throw redirect(303, `${adminPrefix}/style`);
	}
};
