import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';

export async function load() {
	const errorPages = await collections.cmsPages.countDocuments({
		_id: 'error'
	});

	if (errorPages) {
		throw redirect(303, '/error');
	} else {
		throw error(404, 'Page not found');
	}
}
