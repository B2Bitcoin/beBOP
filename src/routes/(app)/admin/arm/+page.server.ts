import { collections } from '$lib/server/database';
import { CUSTOMER_ROLE_ID } from '$lib/types/User';

export async function load() {
	const nonCustomers = await collections.users
		.find({ roleId: { $ne: CUSTOMER_ROLE_ID } })
		.sort({ createdAt: 1 })
		.toArray();

	return {
		users: nonCustomers.map((user) => ({
			_id: user._id.toString(),
			login: user.login,
			roleId: user.roleId,
			disabled: user.disabled,
			recovery: user.recovery,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		}))
	};
}
