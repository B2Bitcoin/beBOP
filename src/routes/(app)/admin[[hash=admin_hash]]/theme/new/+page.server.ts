import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { set } from 'lodash-es';
import type {
	Theme,
	StyleBody,
	StyleCartPreview,
	StyleFooter,
	StyleHeader,
	StyleNavbar,
	StyleTagWidget
} from '$lib/types/Theme';
import { collections } from '$lib/server/database';

export const load = async () => {};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const json: Theme = {
			_id: crypto.randomUUID(),
			name: '',
			header: {} as StyleHeader,
			navbar: {} as StyleNavbar,
			footer: {} as StyleFooter,
			cartPreview: {} as StyleCartPreview,
			body: {} as StyleBody,
			tagWidget: {} as StyleTagWidget,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		for (const [key, value] of formData) {
			set(json, key, value);
		}

		await collections.themes.insertOne(json);

		throw redirect(303, '/admin/style');
	}
};
