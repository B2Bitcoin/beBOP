import { collections } from '$lib/server/database.js';
import { MAX_NAME_LIMIT } from '$lib/types/Product.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export async function load({ params }) {
	const challenge = await collections.challenges.findOne({
		_id: params.id
	});

	if (!challenge) {
		throw error(404, 'Challenge not found');
	}

	const beginsAt = challenge.beginsAt?.toJSON().slice(0, 10);
	const endsAt = challenge.endsAt.toJSON().slice(0, 10);

	return {
		challenge,
		beginsAt,
		endsAt
	};
}

export const actions = {
	update: async function ({ request, params }) {
		const challenge = await collections.challenges.findOne({
			_id: params.id
		});

		if (!challenge) {
			throw error(404, 'Challenge not found');
		}

		const data = await request.formData();

		const { name, goalAmount, beginsAt, endsAt } = z
			.object({
				name: z.string().min(1).max(MAX_NAME_LIMIT),
				// productId: z.string().array(),
				goalAmount: z.number({ coerce: true }).int().positive(),
				beginsAt: z.date({ coerce: true }),
				endsAt: z.date({ coerce: true })
			})
			.parse(Object.fromEntries(data));

		await collections.challenges.updateOne(
			{
				_id: challenge._id
			},
			{
				$set: {
					name,
					"goal.amount": goalAmount,
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
