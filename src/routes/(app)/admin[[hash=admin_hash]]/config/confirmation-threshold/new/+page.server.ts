import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { z } from 'zod';
import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import { runtimeConfig } from '$lib/server/runtime-config.js';

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		console.log('runtimeConfig ', runtimeConfig);

		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const { minAmount, maxAmount, confirmationBlocks } = z
			.object({
				minAmount: z.number({ coerce: true }),
				maxAmount: z.number({ coerce: true }),
				confirmationBlocks: z.number({ coerce: true })
			})
			.parse(json);

		for (const threshold of runtimeConfig.confirmationBlocksThresholds) {
			if (
				(minAmount >= threshold.minAmount && minAmount <= threshold.maxAmount) ||
				(maxAmount >= threshold.minAmount && maxAmount <= threshold.maxAmount) ||
				(minAmount < threshold.minAmount && maxAmount > threshold.maxAmount)
			) {
				throw error(400, 'threshold already exist!');
			}
		}

		await collections.runtimeConfig.updateOne(
			{ _id: 'confirmationBlocksThresholds' },
			{
				$push: {
					// @ts-expect-error is not undefined
					data: {
						_id: crypto.randomUUID(),
						minAmount,
						maxAmount,
						confirmationBlocks,
						currency: runtimeConfig.mainCurrency
					}
				},
				$set: {
					updatedAt: new Date()
				}
			},
			{ upsert: true }
		);

		throw redirect(303, '/admin/config/confirmation-threshold');
	}
};
