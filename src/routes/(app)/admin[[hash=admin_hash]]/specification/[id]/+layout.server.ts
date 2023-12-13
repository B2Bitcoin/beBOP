import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const specification = await collections.specifications.findOne({ _id: params.id });

	if (!specification) {
		throw error(404, 'specification not found');
	}
	return {
		specification
	};
};
