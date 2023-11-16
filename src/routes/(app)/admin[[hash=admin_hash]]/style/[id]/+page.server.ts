import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { collections } from '$lib/server/database';

export const load = async ({ params }) => {
	const style = await collections.styles.findOne({ _id: params.id });
	return {
		style
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			set(json, key, value);
		}
		await collections.styles.updateOne(
			{ _id: params.id },
			{
				$set: json
			}
		);

		throw redirect(303, '/admin/style');
	}
};
