import { collections } from '$lib/server/database.js';
import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export const load = async ({ params }) => {
	const userId = new ObjectId(params.id);

	const user = await collections.users.findOne({ _id: userId });

	if (!user) {
		throw error(404, 'User not found');
	}

	return {
		user: {
			login: user.login,
			_id: user._id.toString()
		}
	};
};
