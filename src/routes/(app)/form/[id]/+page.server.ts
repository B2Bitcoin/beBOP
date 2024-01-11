import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const contactForm = await collections.contactForms.findOne({ _id: params.id });

	if (!contactForm) {
		throw error(404, 'contact form not found');
	}

	return {
		contactForm
	};
};
