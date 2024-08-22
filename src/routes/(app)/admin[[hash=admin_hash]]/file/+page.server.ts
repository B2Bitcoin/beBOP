import { collections } from '$lib/server/database';

export const load = async () => {
	return {
		pictures: await collections.digitalFiles.find({}).toArray()
	};
};
