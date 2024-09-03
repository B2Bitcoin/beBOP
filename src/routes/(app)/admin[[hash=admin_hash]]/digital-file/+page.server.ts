import { collections } from '$lib/server/database';

export const load = async () => {
	return {
		files: await collections.digitalFiles.find({ productId: { $exists: false } }).toArray()
	};
};
