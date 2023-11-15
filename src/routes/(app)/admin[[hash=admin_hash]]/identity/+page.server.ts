import { runtimeConfig } from '$lib/server/runtime-config.js';
import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
import { error } from '@sveltejs/kit';

export function load({ locals }) {
	// Until https://github.com/B2Bitcoin/beBOP/issues/220
	if (locals.user?.roleId !== SUPER_ADMIN_ROLE_ID) {
		throw error(403, 'Forbidden. Only Super Admin can access this page !');
	}

	return {
		sellerIdentity: runtimeConfig.sellerIdentity
	};
}
