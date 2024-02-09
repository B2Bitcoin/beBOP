import { error } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import type { Challenge } from '$lib/types/Challenge';

export const load = async ({ params }) => {
	const challenge = await collections.challenges.findOne<
		Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt' | 'mode'>
	>(
		{ _id: params.id },
		{
			projection: {
				_id: 1,
				name: 1,
				goal: 1,
				progress: 1,
				endsAt: 1,
				mode: 1
			}
		}
	);

	if (!challenge) {
		throw error(404, 'Challenge not found');
	}

	return {
		challenge
	};
};
