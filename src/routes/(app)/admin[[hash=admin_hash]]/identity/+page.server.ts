import { SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
import { error } from '@sveltejs/kit';

export function load({ locals }) {
	if (locals.user?.roleId !== SUPER_ADMIN_ROLE_ID) {
		throw error(403, 'Forbidden. Only Super Admin can access this page !');
	}

	return {};
}
