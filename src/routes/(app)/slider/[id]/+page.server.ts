import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const slider = await collections.sliders.findOne({ _id: params.id });

	if (!slider) {
		throw error(404, 'slider not found');
	}
	const pictures = await collections.pictures
		.find({ 'slider._id': params.id })
		.sort({ createdAt: 1 })
		.toArray();

	return {
		slider,
		pictures
	};
};
