import { redirect } from '@sveltejs/kit';
import { actions as customerLoginActions } from '../../login/+page.server';
import { adminPrefix } from '$lib/server/admin';

export const actions = {
	default: async function (event) {
		const action = customerLoginActions.clearAll;

		// @ts-expect-error different route but compatible
		await action(event);

		throw redirect(303, `${adminPrefix()}/login`);
	}
};
