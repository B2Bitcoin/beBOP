import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { z } from 'zod';
import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import { runtimeConfig, type RuntimeConfigItem } from '$lib/server/runtime-config.js';
import type { ConfirmationThresholds } from '$lib/types/ConfirmationThresholds.js';
import type { WithId } from 'mongodb';

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

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

		const existingConfig: WithId<RuntimeConfigItem> | null =
			await collections.runtimeConfig.findOne({
				_id: 'confirmationBlocksTresholds'
			});

		const existingThresholds: ConfirmationThresholds[] = existingConfig
			? (existingConfig.data as ConfirmationThresholds[])
			: [];

		for (const threshold of existingThresholds) {
			if (
				(minAmount >= threshold.minAmount && minAmount <= threshold.maxAmount) ||
				(maxAmount >= threshold.minAmount && maxAmount <= threshold.maxAmount) ||
				(minAmount < threshold.minAmount && maxAmount > threshold.maxAmount)
			) {
				throw error(400, 'Treshold already exist!');
			}
		}

		await collections.runtimeConfig.updateOne(
			{ _id: 'confirmationBlocksTresholds' },
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
