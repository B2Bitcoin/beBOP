import { collections } from '$lib/server/database';
import type { Style } from '$lib/types/Style';

export const load = async () => {
	const styles = await collections.styles
		.find()
		.project<Pick<Style, '_id' | 'name'>>({ _id: 1, name: 1 })
		.toArray();

	return {
		styles
	};
};
