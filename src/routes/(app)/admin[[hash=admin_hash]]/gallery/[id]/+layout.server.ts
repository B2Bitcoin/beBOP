import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const gallery = await collections.galleries.findOne({ _id: params.id });

	if (!gallery) {
		throw error(404, 'gallery not found');
	}

	return {
		gallery
	};
};
