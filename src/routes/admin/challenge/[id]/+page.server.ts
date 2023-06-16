import { collections } from '$lib/server/database.js';
import { MAX_NAME_LIMIT } from '$lib/types/Product.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export async function load({ params }) {
	const challenge = await collections.challenges.findOne({
		_id: params.id
	});

	if (!challenge) {
		throw error(404, 'Page not found');
	}

	return {
		challenge
	};
}

export const actions = {
	update: async function ({ request, params }) {
		const challenge = await collections.challenges.findOne({
			_id: params.id
		});

		if (!challenge) {
			throw error(404, 'Page not found');
		}

		const data = await request.formData();

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

		await collections.challenges.updateOne(
			{
				_id: challenge._id
			},
			{
				$set: {
					name,
					goalAmount,
					mode,
					beginsAt,
					endsAt,
					updatedAt: new Date()
				}
			}
		);
	},

	delete: async function ({ params }) {
		await collections.challenges.deleteOne({
			_id: params.id
		});

		throw redirect(303, '/admin/challenge');
	}
};
