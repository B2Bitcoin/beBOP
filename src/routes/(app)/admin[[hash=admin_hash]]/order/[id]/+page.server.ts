import { adminPrefix } from '$lib/server/admin.js';
import { collections, withTransaction } from '$lib/server/database';
import { onOrderPaid } from '$lib/server/orders';
import type { Order } from '$lib/types/Order.js';
import { error, redirect } from '@sveltejs/kit';
import type { StrictFilter } from 'mongodb';

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
						'payment.paidAt': new Date()
					} satisfies StrictFilter<Order>
				},
				{ session }
			);

			await onOrderPaid(order, order.totalPrice, session);
		});

		throw redirect(303, request.headers.get('referer') || `${adminPrefix()}/order`);
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
					} satisfies StrictFilter<Order>
				},
				{ session }
			);
		});

		throw redirect(303, request.headers.get('referer') || `${adminPrefix()}/order`);
	}
};
