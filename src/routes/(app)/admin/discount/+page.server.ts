import { collections } from '$lib/server/database';

export const load = async () => {
	const discounts = await collections.discounts.find({}).toArray();

	return {
		discounts
	};
};
