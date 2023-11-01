import { collections } from '$lib/server/database.js';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { z } from 'zod';
import { error, redirect } from '@sveltejs/kit';
import type { WithId } from 'mongodb';
import { runtimeConfig, type RuntimeConfigItem } from '$lib/server/runtime-config.js';
import type { ConfirmationThresholds } from '$lib/types/ConfirmationThresholds.js';
import { CURRENCIES } from '$lib/types/Currency';
import { toSatoshis } from '$lib/utils/toSatoshis.js';

export const load = async ({ params }) => {
	const existingThreshold = runtimeConfig.confirmationBlocksThresholds.find(
		(el: ConfirmationThresholds) => el._id === params.id
	);

	if (!existingThreshold) {
		throw error(404, 'Threshold not found');
	}

	return {
		existingThreshold
	};
};

export const actions = {
	update: async function ({ request, params }) {
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

		const existingThresholds = runtimeConfig.confirmationBlocksThresholds;

		for (const threshold of runtimeConfig.confirmationBlocksThresholds) {
			if (threshold._id === params.id) {
				continue;
			}

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
		}

		const thresholdToUpdate = existingThresholds.find((threshold) => threshold._id === params.id);

		if (!thresholdToUpdate) {
			throw error(404, 'Threshold with given ID not found!');
		}

		thresholdToUpdate.minAmount = minAmount;
		thresholdToUpdate.maxAmount = maxAmount;
		thresholdToUpdate.currency = currency;
		thresholdToUpdate.confirmationBlocks = confirmationBlocks;

		await collections.runtimeConfig.updateOne(
			{ _id: 'confirmationBlocksThresholds' },
			{
				$set: {
					data: existingThresholds,
					updatedAt: new Date()
				}
			}
		);

		throw redirect(303, '/admin/config/confirmation-threshold');
	},
	delete: async function ({ params }) {
		const existingConfig: WithId<RuntimeConfigItem> | null =
			await collections.runtimeConfig.findOne({
				_id: 'confirmationBlocksThresholds'
			});

		const filteredThresholds = existingConfig
			? // @ts-expect-error is not unknown
			  existingConfig.data.filter((el: ConfirmationThresholds) => el._id !== params.id)
			: [];

		await collections.runtimeConfig.updateOne(
			{ _id: 'confirmationBlocksThresholds' },
			{
				$set: {
					data: filteredThresholds,
					updatedAt: new Date()
				}
			}
		);

		throw redirect(303, '/admin/config/confirmation-threshold');
	}
};
