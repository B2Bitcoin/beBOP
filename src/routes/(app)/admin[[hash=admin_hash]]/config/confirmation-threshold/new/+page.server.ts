import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { z } from 'zod';
import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { CURRENCIES } from '$lib/types/Currency';
import { toSatoshis } from '$lib/utils/toSatoshis.js';

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const { minAmount, maxAmount, currency, confirmationBlocks } = z
			.object({
				minAmount: z.number({ coerce: true }),
				maxAmount: z.number({ coerce: true }),
				currency: z.enum([CURRENCIES[0], ...CURRENCIES.slice(1).filter((c) => c !== 'SAT')]),
				confirmationBlocks: z.number({ coerce: true })
			})
			.parse(json);

		for (const threshold of runtimeConfig.confirmationBlocksThresholds) {
			const minAmountToSat = toSatoshis(minAmount, currency);
			const maxAmountToSat = toSatoshis(maxAmount, currency);
			const minThresholdAmountToSat = toSatoshis(threshold.minAmount, threshold.currency);
			const maxThresholdAmountToSat = toSatoshis(threshold.maxAmount, threshold.currency);

			if (
				(minAmountToSat >= minThresholdAmountToSat && minAmountToSat < maxThresholdAmountToSat) ||
				(maxAmountToSat > minThresholdAmountToSat && maxAmountToSat < maxThresholdAmountToSat) ||
				(minAmountToSat <= minThresholdAmountToSat && maxAmountToSat >= maxThresholdAmountToSat)
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
						currency,
						confirmationBlocks
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
