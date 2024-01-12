import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { omit } from 'lodash-es';
import { cmsFromContent } from '$lib/server/cms.js';
import { ORIGIN, SMTP_USER } from '$env/static/private';
import { ObjectId } from 'mongodb';
import { runtimeConfig } from '$lib/server/runtime-config';
import { mapKeys } from '$lib/utils/mapKeys';
import { z } from 'zod';
import { rateLimit } from '$lib/server/rateLimit';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';

export async function load({ params, locals }) {
	const cmsPage = await collections.cmsPages.findOne(
		{
			_id: params.slug
		},
		{
			projection: {
				content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
				title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
				shortDescription: {
					$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
				},
				fullScreen: 1,
				maintenanceDisplay: 1
			}
		}
	);

	if (!cmsPage) {
		throw error(404, 'CMS Page not found');
	}

	return {
		cmsPage: omit(cmsPage, ['content']),
		cmsData: cmsFromContent(cmsPage.content, locals),
		layoutReset: cmsPage.fullScreen
	};
}
export const actions = {
	sendEmail: async function ({ request, locals }) {
		rateLimit(locals.clientIp, 'email', 5, { minutes: 5 });

		const data = await request.formData();
		const parsed = z
			.object({
				content: z.string().max(MAX_CONTENT_LIMIT),
				target: z.string().max(100),
				subject: z.string().max(100)
			})
			.parse(Object.fromEntries(data));

		const lowerVars = mapKeys(
			{
				websiteLink: ORIGIN,
				brandName: runtimeConfig.brandName
			},
			(key) => key.toLowerCase()
		);
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: parsed.subject.replace(/{{([^}]+)}}/g, (match, p1) => {
				return lowerVars[p1.toLowerCase()] || match;
			}),
			htmlContent: parsed.content.replace(/{{([^}]+)}}/g, (match, p1) => {
				return lowerVars[p1.toLowerCase()] || match;
			}),
			dest: parsed.target || SMTP_USER
		});
	}
};
