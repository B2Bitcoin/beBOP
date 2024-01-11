import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const contactForm = await collections.contactForms.findOne({ _id: params.id });

	if (!contactForm) {
		throw error(404, 'specification not found');
	}

	return {
		contactForm,
		target: runtimeConfig.sellerIdentity?.contact.email || ''
	};
};
