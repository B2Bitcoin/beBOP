import { collections } from '$lib/server/database';
import { OrderLabel } from '$lib/types/OrderLabel';

export function load() {
	return {
		labels: collections.labels
			.find({})
			.project<Pick<OrderLabel, '_id' | 'name'>>({
				_id: 1,
				name: 1
			})
			.sort({ updatedAt: -1 })
			.toArray()
	};
}
