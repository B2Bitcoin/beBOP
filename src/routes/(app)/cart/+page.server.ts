import { checkCartItems } from '$lib/server/cart';

export async function load({ parent, locals }) {
	const parentData = await parent();

	if (parentData.cart) {
		try {
			await checkCartItems(parentData.cart, { sessionId: locals.sessionId });
		} catch (err) {
			if (
				typeof err === 'object' &&
				err &&
				'body' in err &&
				typeof err.body === 'object' &&
				err.body &&
				'message' in err.body &&
				typeof err.body.message === 'string'
			) {
				return { errorMessage: err.body.message };
			}
		}
	}
	return {};
}
