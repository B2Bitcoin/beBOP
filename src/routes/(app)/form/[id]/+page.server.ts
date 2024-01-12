import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

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
