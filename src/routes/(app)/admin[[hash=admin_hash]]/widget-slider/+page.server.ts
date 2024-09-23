import { collections } from '$lib/server/database';

export const load = async () => {
	const widgetSliders = await collections.widgetSliders.find({}).toArray();
	return {
		widgetSliders
	};
};

export const actions = {};
