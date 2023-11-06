import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT, type Product } from '$lib/types/Product';
import { generateId } from '$lib/utils/generateId';
import { adminPrefix } from '$lib/server/admin';

export const load = async () => {
	const products = await collections.products
		.find({})
		.project<Pick<Product, 'name' | '_id'>>({ name: 1 })
		.toArray();

	return {
		products
	};
};

export const actions: Actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const { name, goalAmount, mode, productIds, beginsAt, endsAt } = z
			.object({
				name: z.string().min(1).max(MAX_NAME_LIMIT),
				productIds: z.string().array(),
				goalAmount: z.number({ coerce: true }).int().positive(),
				mode: z.enum(['totalProducts', 'moneyAmount']),
				beginsAt: z.date({ coerce: true }),
				endsAt: z.date({ coerce: true })
			})
			.parse({
				name: data.get('name'),
				productIds: data.getAll('productIds'),
				goalAmount: data.get('goalAmount'),
				mode: data.get('mode'),
				beginsAt: data.get('beginsAt'),
				endsAt: data.get('endsAt')
			});

		const slug = generateId(name, true);
		await collections.challenges.insertOne({
			_id: slug,
			name,
			productIds: productIds,
			goal: { amount: goalAmount, ...(mode === 'moneyAmount' && { currency: 'SAT' }) },
			progress: 0,
			beginsAt,
			endsAt,
			mode,
			recurring: false,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `${adminPrefix()}/challenge`);
	}
};
