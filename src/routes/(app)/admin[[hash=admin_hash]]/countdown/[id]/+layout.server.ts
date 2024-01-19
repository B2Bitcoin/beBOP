import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const countdown = await collections.countdowns.findOne({ _id: params.id });

	if (!countdown) {
		throw error(404, 'countdown not found');
	}
	return {
		countdown
	};
};
