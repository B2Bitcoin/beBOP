import { error } from '@sveltejs/kit';
import { actions as adminOrderActions } from '../../../admin[[hash=admin_hash]]/order/[id]/+page.server';
import { collections } from '$lib/server/database';

export const actions = {
	addPayment: async function (event) {
		const { id } = event.params;
		const order = await collections.orders.findOne({ _id: id });

		if (!order?.user.userId?.equals(event.locals.user?._id ?? '')) {
			throw error(403, 'Order does not belong to this POS account.');
		}

		const addPayment = adminOrderActions.addPayment;

		// @ts-expect-error different route but compatible
		return addPayment(event);
	}
};
