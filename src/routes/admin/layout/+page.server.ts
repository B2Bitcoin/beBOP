import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { z } from 'zod';
import type { JsonObject } from 'type-fest';
import { set, isEqual } from 'lodash-es';

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const res = z
			.object({
				brandName: z.string().min(1).trim().optional(),
				topbarLinks: z
					.array(z.object({ href: z.string().trim(), label: z.string().trim() }))
					.optional(),
				footerLinks: z
					.array(z.object({ href: z.string().trim(), label: z.string().trim() }))
					.optional(),
				navbarLinks: z
					.array(z.object({ href: z.string().trim(), label: z.string().trim() }))
					.optional()
			})
			.parse(json);

		if (res.brandName && res.brandName !== runtimeConfig.brandName) {
			runtimeConfig.brandName = res.brandName;
			await collections.runtimeConfig.updateOne(
				{
					_id: 'brandName'
				},
				{
					$set: {
						data: res.brandName,
						updatedAt: new Date()
					}
				}
			);
		}

		for (const linkKey of ['topbarLinks', 'navbarLinks', 'footerLinks'] as const) {
			const array = res[linkKey]?.filter((item) => item.href && item.label);

			if (array && !isEqual(array, runtimeConfig[linkKey])) {
				runtimeConfig[linkKey] = array;
				await collections.runtimeConfig.updateOne(
					{
						_id: linkKey
					},
					{
						$set: {
							data: array,
							updatedAt: new Date()
						}
					}
				);
			}
		}
	}
};
