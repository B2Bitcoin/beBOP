import { collections } from '$lib/server/database';

export const load = () => {
	return {
		roles: collections.roles.find().sort({ createdAt: 1 }).toArray()
	};
};
