import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT, type Product } from '$lib/types/Product';
import { generateId } from '$lib/utils/generateId';

export const load = async () => {
	const products = await collections.products
		.find({ type: 'subscription' })
		.project<Pick<Product, 'name' | '_id'>>({ name: 1 })
		.toArray();

	return {
		products
	};
};

export const actions: Actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const { name, percentage, productIds, beginsAt, endsAt } = z
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

		const slug = generateId(name, true);
		await collections.discounts.insertOne({
			_id: slug,
			name,
			productIds: productIds,
			percentage: Number(percentage),
			beginsAt,
			endsAt,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `/admin/discount`);
	}
};
