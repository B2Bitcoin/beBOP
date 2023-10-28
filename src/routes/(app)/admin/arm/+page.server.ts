import { collections } from '$lib/server/database';
import { CUSTOMER_ROLE_ID } from '$lib/types/User';

export async function load() {
	const nonCustomers = await collections.users
		.find({ roleId: { $ne: CUSTOMER_ROLE_ID } })
		.toArray();

	return {
		users: nonCustomers.map((user) => ({
			_id: user._id.toString(),
			login: user.login,
			role: user.roleId,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		}))
	};
}
