import { collections } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const challenges = await collections.challenges.find({}).toArray();

	return {
		challenges
	};
};
