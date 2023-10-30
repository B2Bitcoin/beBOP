import { collections, withTransaction } from '$lib/server/database';
import { onOrderPaid } from '$lib/server/orders';
import { toSatoshis } from '$lib/utils/toSatoshis';
import { error, redirect } from '@sveltejs/kit';

export const actions = {
	confirm: async ({ params, request }) => {
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
						updatedAt: new Date(),
						'payment.status': 'paid',
						'payment.paidAt': new Date(),
						'payment.totalReceived': toSatoshis(order.totalPrice.amount, order.totalPrice.currency)
					}
				},
				{ session }
			);

			await onOrderPaid(order, session);
		});

		throw redirect(303, request.headers.get('referer') || '/admin/order');
	},
	cancel: async ({ params, request }) => {
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
						'payment.status': 'canceled',
						updatedAt: new Date()
					}
				},
				{ session }
			);
		});

		throw redirect(303, request.headers.get('referer') || '/admin/order');
	}
};
