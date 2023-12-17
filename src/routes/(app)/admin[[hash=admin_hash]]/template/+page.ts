import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	const res = await parent();
	throw redirect(303, `${res.adminPrefix}/template/emails`);
}
