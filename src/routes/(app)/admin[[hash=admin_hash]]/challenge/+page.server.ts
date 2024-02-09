import { collections } from '$lib/server/database';

export const load = async () => {
	const challenges = await collections.challenges.find({}).sort({ updatedAt: -1 }).toArray();

	return {
		challenges
	};
};
