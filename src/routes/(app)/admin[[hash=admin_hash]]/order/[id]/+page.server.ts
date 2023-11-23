import { adminPrefix } from '$lib/server/admin.js';
import { collections, withTransaction } from '$lib/server/database';
import { onOrderPaid } from '$lib/server/orders';
import { runtimeConfig } from '$lib/server/runtime-config';
import type { Order } from '$lib/types/Order.js';
import { toCurrency } from '$lib/utils/toCurrency';
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
						'payment.paidAt': new Date(),
						totalReceived: order.totalPrice,
						'amountsInOtherCurrencies.main.totalReceived': {
							amount: toCurrency(
								runtimeConfig.mainCurrency,
								order.totalPrice.amount,
								order.totalPrice.currency
							),
							currency: runtimeConfig.mainCurrency
						},
						...(runtimeConfig.secondaryCurrency && {
							'amountsInOtherCurrencies.secondary.totalReceived': {
								amount: toCurrency(
									runtimeConfig.secondaryCurrency,
									order.totalPrice.amount,
									order.totalPrice.currency
								),
								currency: runtimeConfig.secondaryCurrency
							}
						}),
						'amountsInOtherCurrencies.priceReference.totalReceived': {
							amount: toCurrency(
								runtimeConfig.priceReferenceCurrency,
								order.totalPrice.amount,
								order.totalPrice.currency
							),
							currency: runtimeConfig.priceReferenceCurrency
						}
					} satisfies StrictFilter<Order>
				},
				{ session }
			);

			await onOrderPaid(order, session);
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
