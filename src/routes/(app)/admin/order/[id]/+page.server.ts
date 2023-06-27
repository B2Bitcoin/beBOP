import { collections, withTransaction } from '$lib/server/database.js';
import { onOrderPaid } from '$lib/server/orders.js';
import { toSatoshis } from '$lib/utils/toSatoshis.js';
import { error, redirect } from '@sveltejs/kit';

export const actions = {
	confirm: async ({ params }) => {
		const order = await collections.orders.findOne({
			_id: params.id
		});

		if (!order) {
			throw error(404, 'Order not found');
		}

		if (order.payment.status !== 'pending') {
			throw error(400, 'Order is not pending');
		}

		await withTransaction(async (session) => {
			await collections.orders.updateOne(
				{ _id: order._id },
				{
					$set: {
						'payment.status': 'paid',
						'payment.paidAt': new Date(),
						'payment.totalReceived': toSatoshis(order.totalPrice.amount, order.totalPrice.currency)
					}
				},
				{ session }
			);

			await onOrderPaid(order, session);
		});

		throw redirect(303, '/admin/order');
	},
	cancel: async ({ params }) => {
		const order = await collections.orders.findOne({
			_id: params.id
		});

		if (!order) {
			throw error(404, 'Order not found');
		}

		if (order.payment.status !== 'pending') {
			throw error(400, 'Order is not pending');
		}

		await withTransaction(async (session) => {
			await collections.orders.updateOne(
				{ _id: order._id },
				{
					$set: {
						'payment.status': 'canceled'
					}
				},
				{ session }
			);
		});

		throw redirect(303, '/admin/order');
	}
};
