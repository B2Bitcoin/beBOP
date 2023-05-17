import { redirect } from '@sveltejs/kit';

export async function load({ parent, data }) {
	const res = await parent();

	if (!res.cart?.length) {
		throw redirect(303, '/cart');
	}

	return data;
}
