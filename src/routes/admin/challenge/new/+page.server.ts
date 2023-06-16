import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { generateId } from '$lib/utils/generateId';

export const actions: Actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const productIds: string[] = [];
		const { name, goalAmount, mode, beginsAt, endsAt } = z
			.object({
				name: z.string().min(1).max(MAX_NAME_LIMIT),
				// productId: z.string().array(),
				goalAmount: z.number({ coerce: true }).int().positive(),
				mode: z.enum(['totalProducts', 'moneyAmount']),
				beginsAt: z.date({ coerce: true }).optional(),
				endsAt: z.date({ coerce: true })
			})
			.parse({
				name: data.get('name'),
				// productId: data.get('productId'),
				goalAmount: data.get('goalAmount'),
				mode: data.get('mode'),
				beginsAt: data.get('beginsAt') || undefined,
				endsAt: data.get('endsAt')
			});

		const slug = generateId(name, true);

		await collections.challenges.insertOne({
			_id: slug,
			name,
			productIds: productId,
			goal: { amount: goalAmount, currency: 'SAT' },
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
