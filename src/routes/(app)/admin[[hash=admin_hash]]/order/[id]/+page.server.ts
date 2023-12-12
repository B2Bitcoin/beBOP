import { collections } from '$lib/server/database';
import { addOrderPayment } from '$lib/server/orders';
import { paymentMethods, type PaymentMethod } from '$lib/server/payment-methods.js';
import { parsePriceAmount } from '$lib/types/Currency.js';
import { orderAmountWithNoPaymentsCreated as orderAmountWithNoPayments } from '$lib/types/Order.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const actions = {
	addPayment: async ({ params, request, locals }) => {
		const order = await collections.orders.findOne({
			_id: params.id
		});

		if (!order) {
			throw error(404, 'Order not found');
		}

		if (order.status !== 'pending') {
			throw error(400, 'Order is not pending');
		}

		const remainingAmount = orderAmountWithNoPayments(order);

		if (remainingAmount <= 0) {
			throw error(400, 'Order has no remaining amount to pay');
		}
		const formData = await request.formData();
		const parsed = z
			.object({
				amount: z.string().regex(/^\d+(\.\d+)?$/),
				method: z.enum(paymentMethods(locals.user?.roleId) as [PaymentMethod, ...PaymentMethod[]])
			})
			.parse({
				amount: formData.get('amount'),
				method: formData.get('method')
			});

		const amount = parsePriceAmount(parsed.amount, order.currencySnapshot.main.totalPrice.currency);
		if (amount <= 0) {
			throw error(400, 'Invalid amount');
		}
		if (amount > remainingAmount) {
			throw error(400, 'Amount is greater than the remaining amount to pay');
		}

		await addOrderPayment(order, parsed.method, amount, { expiresAt: null });

		throw redirect(303, `/order/${order._id}`);
	}
};
