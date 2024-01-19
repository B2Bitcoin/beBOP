import { collections } from '$lib/server/database';
import type { Countdown } from '$lib/types/Countdown';

export function load() {
	return {
		countdowns: collections.countdowns
			.find({})
			.project<Pick<Countdown, '_id' | 'title'>>({
				_id: 1,
				title: 1
			})
			.sort({ updatedAt: -1 })
			.toArray()
	};
}
