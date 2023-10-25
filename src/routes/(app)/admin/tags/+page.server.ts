import { collections } from '$lib/server/database';

export const load = async () => {
	const tags = await collections.tags.find({}).toArray();

	return {
		tags
	};
};
