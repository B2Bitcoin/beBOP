import { redirect } from '@sveltejs/kit';
import { actions as customerLoginActions } from '../../customer/login/+page.server';

export const actions = {
	default: async function (event) {
		const action = customerLoginActions.clearAll;

		// @ts-expect-error different route but compatible
		await action(event);

		throw redirect(303, '/admin/login');
	}
};
