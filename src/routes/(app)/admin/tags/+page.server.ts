import { collections } from '$lib/server/database';
import { filter } from 'lodash-es';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const tags = await collections.tags.find({}).toArray();

	return {
		tags
	};
};
