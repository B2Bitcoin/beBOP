import { adminPrefix } from '$lib/server/admin';
import { collections } from '$lib/server/database';
import type { OrderLabel } from '$lib/types/OrderLabel';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ params }) => {
	const labels = await collections.labels
		.find({})
		.project<Pick<OrderLabel, '_id' | 'name'>>({ _id: 1, name: 1 })
		.toArray();
	const order = await collections.orders.findOne({
		_id: params.id
	});

	if (!order) {
		throw error(404, 'Order not found');
	}
	return {
		labels,
		orderLabelIds: order.orderLabelIds
	};
};
export const actions = {
	default: async function ({ request, params }) {
		const formData = await request.formData();
		const orderLabelString = formData.get('orderLabel');
		if (!orderLabelString) {
			throw error(400, 'No orderLabel provided');
		}
		const orderLabel = JSON.parse(String(orderLabelString));
		const result = z
			.object({
				orderLabel: z.string().array()
			})
			.parse({
				orderLabel
			});
		await collections.orders.updateOne(
			{
				_id: params.id
			},
			{
				$set: {
					orderLabelIds: result.orderLabel,
					updatedAt: new Date()
				}
			}
		);

		throw redirect(303, `${adminPrefix()}/order`);
	}
};
