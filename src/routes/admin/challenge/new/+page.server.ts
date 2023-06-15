import { collections } from '$lib/server/database';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_NAME_LIMIT } from '$lib/types/Product';

export const actions: Actions = {
	default: async function ({ request }) {
		const data = await request.formData();

		const productId = [''];
		const { name, goalAmount, mode, endsAt } = z
			.object({
				name: z.string().min(1).max(MAX_NAME_LIMIT),
				// productId: z.string().array(),
				goalAmount: z.string().regex(/^\d+(\.\d+)?$/),
				mode: z.enum(['money amount', 'order quantity']),
				endsAt: z.date({ coerce: true })
			})
			.parse({
				name: data.get('name'),
				// productId: data.get('productId'),
				goalAmount: data.get('goalAmount'),
				mode: data.get('mode'),
				endsAt: data.get('endsAt')
			});

		const existing = await collections.challenges.countDocuments({ _id: name });

		if (existing) {
			throw error(409, 'challenge with same slug already exists');
		}

		await collections.challenges.insertOne({
			_id: name,
			name,
			productIds: productId,
			goal: { amount: parseInt(goalAmount), currency: 'SAT' },
			progress: { amount: 0, currency: 'SAT' },
			endsAt,
			mode,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `/admin/challenge`);
	}
};
