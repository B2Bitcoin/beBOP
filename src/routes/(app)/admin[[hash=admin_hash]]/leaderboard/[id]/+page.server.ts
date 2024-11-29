import { adminPrefix } from '$lib/server/admin.js';
import { collections } from '$lib/server/database';
import { parsePriceAmount } from '$lib/types/Currency';
import { MAX_NAME_LIMIT, type Product } from '$lib/types/Product';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export async function load({ params }) {
	const leaderboard = await collections.leaderboards.findOne({
		_id: params.id
	});

	if (!leaderboard) {
		throw error(404, 'leaderboard not found');
	}

	const beginsAt = leaderboard.beginsAt;
	const endsAt = leaderboard.endsAt;
	const products = await collections.products
		.find({})
		.project<Pick<Product, 'name' | '_id'>>({ name: 1 })
		.toArray();

	return {
		leaderboard,
		beginsAt,
		endsAt,
		products
	};
}

export const actions = {
	update: async function ({ request, params }) {
		const leaderboard = await collections.leaderboards.findOne({
			_id: params.id
		});

		if (!leaderboard) {
			throw error(404, 'leaderboard not found');
		}

		const data = await request.formData();

		// We don't allow changing the currency, or the mode
		const { name, progress, productIds, beginsAt, endsAt, progressChanged, oldProgress } = z
			.object({
				name: z.string().min(1).max(MAX_NAME_LIMIT),
				productIds: z.string().array(),
				progress: z
					.string()
					.regex(/^\d+(\.\d+)?$/)
					.default('0'),
				oldProgress: z
					.string()
					.regex(/^\d+(\.\d+)?$/)
					.default('0'),
				progressChanged: z.boolean({ coerce: true }),
				beginsAt: z.date({ coerce: true }),
				endsAt: z.date({ coerce: true })
			})
			.parse({
				name: data.get('name'),
				productIds: JSON.parse(String(data.get('productIds'))).map(
					(x: { value: string }) => x.value
				),
				progress: data.get('progress'),
				beginsAt: data.get('beginsAt'),
				endsAt: data.get('endsAt'),
				progressChanged: data.get('progressChanged'),
				oldProgress: data.get('oldProgress')
			});

		const parsedProgress =
			leaderboard.mode === 'moneyAmount' && leaderboard.currency
				? parsePriceAmount(progress, leaderboard.currency)
				: parseInt(progress);
		const parsedOldProgress =
			leaderboard.mode === 'moneyAmount' && leaderboard.currency
				? parsePriceAmount(oldProgress, leaderboard.currency)
				: parseInt(oldProgress);

		const updateResult = await collections.leaderboards.updateOne(
			{
				_id: leaderboard._id,
				...(progressChanged && { progress: parsedOldProgress })
			},
			{
				$set: {
					name,
					productIds,
					progress: parsedProgress,
					beginsAt,
					endsAt,
					updatedAt: new Date()
				}
			}
		);

		if (!updateResult.matchedCount && progressChanged) {
			throw error(
				409,
				"A new order was made in parallel which updated the leaderboard's progress. Please try again"
			);
		}
	},

	delete: async function ({ params }) {
		await collections.leaderboards.deleteOne({
			_id: params.id
		});

		throw redirect(303, `${adminPrefix()}/leaderboard`);
	}
};
