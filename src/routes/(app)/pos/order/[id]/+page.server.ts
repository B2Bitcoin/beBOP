import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { actions as adminOrderActions } from '../../../admin/order/[id]/+page.server';

export const actions = {
	confirm: async (event) => {
		const { id } = event.params;
		const order = await collections.orders.findOne({ _id: id });

		if (!order?.user.userId?.equals(event.locals.user?._id ?? '')) {
			throw error(403, 'Order does not belong to this POS account.');
		}

		// @ts-expect-error different route but compatible
		return adminOrderActions.confirm(event);
	},

	cancel: async (event) => {
		const { id } = event.params;
		const order = await collections.orders.findOne({ _id: id });

		if (!order?.user.userId?.equals(event.locals.user?._id ?? '')) {
			throw error(403, 'Order does not belong to this POS account.');
		}

		// @ts-expect-error different route but compatible
		return adminOrderActions.cancel(event);
	}
};
