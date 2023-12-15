import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { z } from 'zod';
import type { JsonObject } from 'type-fest';
import { set, isEqual } from 'lodash-es';
import { layoutTranslatableSchema } from './layout-schema';

export const actions = {
	default: async function ({ request }) {
		const formData = await request.formData();

		const json: JsonObject = {};
		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const res = z
			.object({
				usersDarkDefaultTheme: z.boolean({ coerce: true }),
				employeesDarkDefaultTheme: z.boolean({ coerce: true }),
				...layoutTranslatableSchema,
				displayPoweredBy: z.boolean({ coerce: true }),
				displayCompanyInfo: z.boolean({ coerce: true })
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
				},
				{
					upsert: true
				}
			);
		}

		if (res.websiteTitle && res.websiteTitle !== runtimeConfig.websiteTitle) {
			runtimeConfig.websiteTitle = res.websiteTitle;
			await collections.runtimeConfig.updateOne(
				{
					_id: 'websiteTitle'
				},
				{
					$set: {
						data: res.websiteTitle,
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
		}

		if (
			res.websiteShortDescription &&
			res.websiteShortDescription !== runtimeConfig.websiteShortDescription
		) {
			runtimeConfig.websiteShortDescription = res.websiteShortDescription;
			await collections.runtimeConfig.updateOne(
				{
					_id: 'websiteShortDescription'
				},
				{
					$set: {
						data: res.websiteShortDescription,
						updatedAt: new Date()
					}
				},
				{
					upsert: true
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
					},
					{
						upsert: true
					}
				);
			}
		}

		if (res.usersDarkDefaultTheme !== runtimeConfig.usersDarkDefaultTheme) {
			runtimeConfig.usersDarkDefaultTheme = res.usersDarkDefaultTheme;
			await collections.runtimeConfig.updateOne(
				{
					_id: 'usersDarkDefaultTheme'
				},
				{
					$set: {
						data: res.usersDarkDefaultTheme,
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
		}

		if (res.employeesDarkDefaultTheme !== runtimeConfig.employeesDarkDefaultTheme) {
			runtimeConfig.employeesDarkDefaultTheme = res.employeesDarkDefaultTheme;
			await collections.runtimeConfig.updateOne(
				{
					_id: 'employeesDarkDefaultTheme'
				},
				{
					$set: {
						data: res.employeesDarkDefaultTheme,
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
		}
		if (res.displayPoweredBy !== runtimeConfig.displayPoweredBy) {
			runtimeConfig.displayPoweredBy = res.displayPoweredBy;
			await collections.runtimeConfig.updateOne(
				{
					_id: 'displayPoweredBy'
				},
				{
					$set: {
						data: res.displayPoweredBy,
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
		}

		if (res.displayCompanyInfo !== runtimeConfig.displayCompanyInfo) {
			runtimeConfig.displayCompanyInfo = res.displayCompanyInfo;
			await collections.runtimeConfig.updateOne(
				{
					_id: 'displayCompanyInfo'
				},
				{
					$set: {
						data: res.displayCompanyInfo,
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
		}
	}
};
