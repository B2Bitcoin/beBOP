import { collections } from '$lib/server/database';
import type { Tag } from '$lib/types/Tag';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const tag = await collections.tags.findOne<
		Pick<Tag, '_id' | 'name' | 'title' | 'subtitle' | 'content' | 'shortContent' | 'cta'>
	>(
		{ _id: params.id },
		{
			projection: {
				_id: 1,
				name: 1,
				title: 1,
				subtitle: 1,
				content: 1,
				shortContent: 1,
				cta: 1
			}
		}
	);

	if (!tag) {
		throw error(404, 'Tag not found');
	}
	const pictures = await collections.pictures
		.find({ 'tag._id': params.id })
		.sort({ createdAt: 1 })
		.toArray();
	return {
		tag,
		pictures
	};
};
