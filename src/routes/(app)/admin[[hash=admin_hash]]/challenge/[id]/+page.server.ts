import { adminPrefix } from '$lib/server/admin.js';
import { collections } from '$lib/server/database';
import { parsePriceAmount } from '$lib/types/Currency';
import { MAX_NAME_LIMIT, type Product } from '$lib/types/Product';
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
	const products = await collections.products
		.find({})
		.project<Pick<Product, 'name' | '_id'>>({ name: 1 })
		.toArray();

	return {
		challenge,
		beginsAt,
		endsAt,
		products
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

		// We don't allow changing the currency, or the mode
		const { name, goalAmount, productIds, beginsAt, endsAt } = z
			.object({
				name: z.string().min(1).max(MAX_NAME_LIMIT),
				productIds: z.string().array(),
				goalAmount: z
					.string()
					.regex(/^\d+(\.\d+)?$/)
					.default('0'),
				beginsAt: z.date({ coerce: true }),
				endsAt: z.date({ coerce: true })
			})
			.parse({
				name: data.get('name'),
				productIds: JSON.parse(String(data.get('productIds'))).map(
					(x: { value: string }) => x.value
				),
				goalAmount: data.get('goalAmount'),
				beginsAt: data.get('beginsAt'),
				endsAt: data.get('endsAt')
			});

		const amount =
			challenge.mode === 'moneyAmount' && challenge.goal.currency
				? parsePriceAmount(goalAmount, challenge.goal.currency)
				: parseInt(goalAmount);

		if (amount < 0 || isNaN(amount)) {
			throw error(400, 'Invalid amount');
		}

		await collections.challenges.updateOne(
			{
				_id: challenge._id
			},
			{
				$set: {
					name,
					productIds,
					'goal.amount': amount,
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

		throw redirect(303, `${adminPrefix()}/challenge`);
	}
};
