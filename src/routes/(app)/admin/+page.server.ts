import { error, redirect } from '@sveltejs/kit';
import { adminLinks } from './adminLinks.js';
import { isAllowedOnPage } from '$lib/types/Role.js';

export async function load({ parent, locals }) {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	const role = (await parent()).role;

	if (!role) {
		throw error(404, 'Role not found');
	}

	for (const option of adminLinks) {
		if (isAllowedOnPage(role, option.href, 'read')) {
			throw redirect(303, option.href);
		}
	}

	throw error(403, 'Your account does not have access to any of the admin pages');
}
