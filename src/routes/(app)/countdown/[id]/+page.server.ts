import { error } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import type { Countdown } from '$lib/types/Countdown';

export const load = async ({ params, locals }) => {
	const countdown = await collections.countdowns.findOne<
		Pick<Countdown, '_id' | 'shortDescription' | 'description' | 'beginsAt' | 'endsAt'>
	>(
		{ _id: params.id },
		{
			projection: {
				_id: 1,
				shortDescription: {
					$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
				},
				description: { $ifNull: [`$translations.${locals.language}.description`, '$description'] },
				beginsAt: 1,
				endsAt: 1
			}
		}
	);

	if (!countdown) {
		throw error(404, 'Countdown not found');
	}

	return {
		countdown
	};
};
