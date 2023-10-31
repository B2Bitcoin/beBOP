import { collections } from '$lib/server/database';

export const load = async ({}) => {
	const sliders = await collections.sliders.find({}).toArray();
	return {
		sliders
	};
};

export const actions = {};
