import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config';

export async function load({ locals }) {
	/**
	 * Warning: do not send sensitive data here, it will be sent to the client on /admin/login!
	 */
	return {
		deliveryFees: runtimeConfig.deliveryFees,
		role: locals.user?.role ? await collections.roles.findOne({ _id: locals.user.role }) : null
	};
}
