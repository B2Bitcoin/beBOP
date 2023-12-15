import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const tag = await collections.tags.findOne({ _id: params.id });

	if (!tag) {
		throw error(404, 'tag not found');
	}

	return {
		tag
	};
};
