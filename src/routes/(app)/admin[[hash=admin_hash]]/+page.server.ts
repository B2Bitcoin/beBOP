import { CUSTOMER_ROLE_ID } from '$lib/types/User.js';
import { error, redirect } from '@sveltejs/kit';
import { adminPrefix } from '$lib/server/admin';

export async function load({ locals }) {
	if (!locals.user) {
		throw redirect(303, `${adminPrefix()}/login`);
	}

	if (locals.user.roleId === CUSTOMER_ROLE_ID) {
		throw error(403, 'This page is only accessible to administrators');
	}
}
