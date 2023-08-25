import { collections } from '$lib/server/database.js';
import { MAX_NAME_LIMIT, type Product } from '$lib/types/Product.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export async function load({ params }) {
	const discount = await collections.discounts.findOne({
		_id: params.id
	});

	if (!discount) {
		throw error(404, 'discount not found');
	}

	const beginsAt = discount.beginsAt?.toJSON().slice(0, 10);
	const endsAt = discount.endsAt.toJSON().slice(0, 10);
	const products = await collections.products
		.find({ type: 'subscription' })
		.project<Pick<Product, 'name' | '_id'>>({ name: 1 })
		.toArray();

	return {
		discount,
		beginsAt,
		endsAt,
		products
	};
}

export const actions = {
	update: async function ({ request, params }) {
		const discount = await collections.discounts.findOne({
			_id: params.id
		});

		if (!discount) {
			throw error(404, 'discount not found');
		}

		const data = await request.formData();

		const { name, percentage, beginsAt, endsAt } = z
			.object({
				name: z.string().min(1).max(MAX_NAME_LIMIT),
				productIds: z.string().array(),
				percentage: z.string().regex(/^\d+(\.\d+)?$/),
				beginsAt: z.date({ coerce: true }),
				endsAt: z.date({ coerce: true })
			})
			.parse({
				name: data.get('name'),
				productIds: data.getAll('productIds'),
				percentage: data.get('percentage'),
				beginsAt: data.get('beginsAt'),
				endsAt: data.get('endsAt')
			});

		await collections.discounts.updateOne(
			{
				_id: discount._id
			},
			{
				$set: {
					name,
					percentage: Number(percentage),
					beginsAt,
					endsAt,
					updatedAt: new Date()
				}
			}
		);
	},

	delete: async function ({ params }) {
		await collections.discounts.deleteOne({
			_id: params.id
		});

		throw redirect(303, '/admin/discount');
	}
};
