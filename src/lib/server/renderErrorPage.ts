import { error } from '@sveltejs/kit';
import { collections } from './database';

export async function renderErrorPage() {
	const errorPages = await collections.cmsPages.countDocuments({
		_id: 'error'
	});

	if (errorPages) {
		return new Response(null, {
			status: 302,
			headers: {
				location: '/error'
			}
		});
	} else {
		throw error(404, 'Page not found');
	}
}
