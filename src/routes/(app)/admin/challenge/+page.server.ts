import { collections } from '$lib/server/database';

export const load = async () => {
	const challenges = await collections.challenges.find({}).toArray();

	return {
		challenges
	};
};
