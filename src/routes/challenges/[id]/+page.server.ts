import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { collections } from '$lib/server/database';
import type { Challenge } from '$lib/types/Challenge';

export const load: PageServerLoad = async ({ params }) => {
	const challenge = await collections.challenges.findOne<
		Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt'>
	>(
		{ _id: params.id },
		{
			projection: {
				_id: 1,
				name: 1,
				goal: 1,
				progress: 1,
				endsAt: 1
			}
		}
	);

	if (!challenge) {
		throw error(404, 'Resource not found');
	}

	return {
		challenge
	};
};
