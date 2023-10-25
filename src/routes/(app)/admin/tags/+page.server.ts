import { collections } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = async () => {
	const tags = await collections.tags.find({}).toArray();

	return {
		tags
	};
};
