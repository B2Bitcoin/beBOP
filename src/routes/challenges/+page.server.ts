import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const challenge = [
		{
			_id: 'wacom-cintiq',
			name: 'WACOM CINTIQ 24" for an emerging artist.',
			score: 150,
			goal: 600
		}
	];
	if (!challenge) {
		throw error(404, 'Resource not found');
	}

	return {
		challenge
	};
};
