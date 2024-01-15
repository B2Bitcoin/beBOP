import { ORIGIN, SMTP_USER } from '$env/static/private';
import { collections } from '$lib/server/database';
import { rateLimit } from '$lib/server/rateLimit';
import { runtimeConfig } from '$lib/server/runtime-config';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
import { mapKeys } from '$lib/utils/mapKeys';
import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const load = async ({ params, locals }) => {
	const contactForm = await collections.contactForms.findOne(
		{ _id: params.id },
		{
			projection: {
				content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
				subject: { $ifNull: [`$translations.${locals.language}.subject`, '$subject'] },
				target: 1,
				displayFromField: 1
			}
		}
	);

	if (!contactForm) {
		throw error(404, 'contact form not found');
	}

	return {
		contactForm,
		email: locals.email
	};
};

export const actions = {
	sendEmail: async function ({ request, locals }) {
		rateLimit(locals.clientIp, 'email', 5, { minutes: 5 });

		const data = await request.formData();
		const parsed = z
			.object({
				content: z.string().max(MAX_CONTENT_LIMIT),
				target: z.string().max(100),
				subject: z.string().max(100),
				from: z.string().max(100).optional()
			})
			.parse(Object.fromEntries(data));

		const lowerVars = mapKeys(
			{
				websiteLink: ORIGIN,
				brandName: runtimeConfig.brandName
			},
			(key) => key.toLowerCase()
		);
		const htmlContent = parsed.from ? parsed.content + `contact ${parsed.from}` : parsed.content;
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: parsed.subject.replace(/{{([^}]+)}}/g, (match, p1) => {
				return lowerVars[p1.toLowerCase()] || match;
			}),
			htmlContent: htmlContent.replace(/{{([^}]+)}}/g, (match, p1) => {
				return lowerVars[p1.toLowerCase()] || match;
			}),
			dest: parsed.target || SMTP_USER
		});
	}
};