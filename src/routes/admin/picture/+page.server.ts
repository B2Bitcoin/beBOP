import { collections } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		pictures: await collections.pictures.find({ productId: { $exists: false } }).toArray()
	};
};
