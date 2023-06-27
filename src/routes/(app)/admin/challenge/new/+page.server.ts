import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { generateId } from '$lib/utils/generateId';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const products = await collections.products.find({}).toArray();

	return {
		products
	};
};

export const actions: Actions = {
	default: async function ({ request }) {
		const data = await request.formData();
		console.log('data.productIds', data.get('productIds'));

		// const productIds: string[] = [];
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
				productIds: data.get('productIds')?.toString().split(','),
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

		throw redirect(303, `/admin/challenge`);
	}
};
