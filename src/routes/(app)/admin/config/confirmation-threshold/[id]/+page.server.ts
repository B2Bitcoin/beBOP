import { collections } from '$lib/server/database.js';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { z } from 'zod';
import { error, redirect } from '@sveltejs/kit';
import type { WithId } from 'mongodb';
import type { RuntimeConfigItem } from '$lib/server/runtime-config.js';
import type { ConfirmationThresholds } from '$lib/types/ConfirmationThresholds.js';

export const load = async ({ params }) => {
	const existingConfig = await collections.runtimeConfig.findOne({
		_id: 'confirmationBlocksTresholds'
	});

	// @ts-expect-error is not unknown
	const existingThresholds = existingConfig?.data.find(
		(el: ConfirmationThresholds) => el._id === params.id
	);

	console.log(existingThresholds);
	console.log(params.id);
	console.log(existingConfig);

	return {
		existingThresholds
	};
};

export const actions = {
	update: async function ({ request, params }) {
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
			if (threshold._id === params.id) {
				continue;
			}

			if (
				(minAmount >= threshold.minAmount && minAmount <= threshold.maxAmount) ||
				(maxAmount >= threshold.minAmount && maxAmount <= threshold.maxAmount) ||
				(minAmount < threshold.minAmount && maxAmount > threshold.maxAmount)
			) {
				throw error(400, 'Treshold already exist!');
			}
		}

		const thresholdToUpdate = existingThresholds.find((threshold) => threshold._id === params.id);

		if (!thresholdToUpdate) {
			throw error(404, 'Threshold with given ID not found!');
		}

		thresholdToUpdate.minAmount = minAmount;
		thresholdToUpdate.maxAmount = maxAmount;
		thresholdToUpdate.confirmationBlocks = confirmationBlocks;

		await collections.runtimeConfig.updateOne(
			{ _id: 'confirmationBlocksTresholds' },
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
				_id: 'confirmationBlocksTresholds'
			});

		const filteredThresholds = existingConfig
			? // @ts-expect-error is not unknown
			  existingConfig.data.filter((el: ConfirmationThresholds) => el._id !== params.id)
			: [];

		console.log('filteredThresholds ', filteredThresholds);

		await collections.runtimeConfig.updateOne(
			{ _id: 'confirmationBlocksTresholds' },
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
