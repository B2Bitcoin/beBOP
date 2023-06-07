import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const cmsPage = await collections.cmsPages.findOne({
		_id: params.slug
	});

	if (!cmsPage) {
		throw error(404, 'CMS Page not found');
	}

	return { cmsPage };
}
