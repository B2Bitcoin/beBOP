import { collections } from '$lib/server/database';
import { pojo } from '$lib/server/pojo';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const product = await collections.products.findOne({ _id: params.id });
	const subscriptions = await collections.paidSubscriptions
		.find({ productId: params.id })
		.toArray();

	if (!product) {
		throw error(404, 'Product not found');
	}

	return {
		product: pojo(product),
		subscriptions: subscriptions.map((subscription) => ({
			...subscription,
			user: {
				...subscription.user,
				userId: subscription.user.userId?.toString()
			},
			notifications: subscription.notifications.map(pojo)
		}))
	};
};
