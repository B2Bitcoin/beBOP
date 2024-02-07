import { collections } from '$lib/server/database';

export const load = async () => {
	const galleries = await collections.galleries.find({}).toArray();

	return {
		galleries
	};
};
