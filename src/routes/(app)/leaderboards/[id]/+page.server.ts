import { error } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import type { Leaderboard } from '$lib/types/Leaderboard';

export const load = async ({ params }) => {
	const leaderboard = await collections.leaderboards.findOne<
		Pick<Leaderboard, '_id' | 'name' | 'progress' | 'endsAt' | 'mode' | 'beginsAt'>
	>(
		{ _id: params.id },
		{
			projection: {
				_id: 1,
				name: 1,
				progress: 1,
				endsAt: 1,
				beginsAt: 1,
				mode: 1
			}
		}
	);

	if (!leaderboard) {
		throw error(404, 'leaderboard not found');
	}

	return {
		leaderboard
	};
};
