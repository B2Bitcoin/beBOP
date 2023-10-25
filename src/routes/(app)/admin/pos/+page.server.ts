import { collections } from '$lib/server/database';
import { POS_ROLE_ID } from '$lib/types/User';

export async function load() {
	const posUsers = await collections.users.find({ roleId: POS_ROLE_ID }).toArray();

	return {
		posUsers: posUsers.map((user) => ({
			...user,
			_id: user._id.toString()
		}))
	};
}
