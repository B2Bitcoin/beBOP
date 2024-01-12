import { SMTP_USER } from '$env/static/private';
import { collections } from '$lib/server/database';
import { rateLimit } from '$lib/server/rateLimit';
import { MAX_CONTENT_LIMIT } from '$lib/types/CmsPage';
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
				target: 1
			}
		}
	);

	if (!contactForm) {
		throw error(404, 'contact form not found');
	}

	return {
		contactForm
	};
};

export const actions = {
	sendEmail: async function ({ request, params, locals }) {
		const contactForm = await collections.contactForms.findOne({
			_id: params.id
		});

		if (!contactForm) {
			throw error(404, 'Contact form not found');
		}
		rateLimit(locals.clientIp, 'email', 5, { minutes: 5 });

		const data = await request.formData();
		const parsed = z
			.object({
				content: z.string().max(MAX_CONTENT_LIMIT),
				target: z.string().max(100),
				subject: z.string().max(100)
			})
			.parse(Object.fromEntries(data));
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: parsed.subject,
			htmlContent: parsed.content,
			dest: parsed.target || SMTP_USER
		});
	}
};
