import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const widgetSlider = await collections.widgetSliders.findOne({ _id: params.id });

	if (!widgetSlider) {
		throw error(404, 'widget slider not found');
	}

	return {
		widgetSlider
	};
};
