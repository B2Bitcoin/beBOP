import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const label = await collections.labels.findOne({ _id: params.id });

	if (!label) {
		throw error(404, 'Label form not found');
	}
	return {
		label
	};
};
