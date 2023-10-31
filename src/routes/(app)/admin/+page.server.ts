import { CUSTOMER_ROLE_ID } from '$lib/types/User.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	if (locals.user.role === CUSTOMER_ROLE_ID) {
		throw error(403, 'This page is only accessible to administrators');
	}
}
