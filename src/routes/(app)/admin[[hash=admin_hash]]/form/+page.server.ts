import { collections } from '$lib/server/database';
import type { ContactForm } from '$lib/types/ContactForm';

export function load() {
	return {
		contactForms: collections.contactForms
			.find({})
			.project<Pick<ContactForm, '_id' | 'title'>>({
				_id: 1,
				title: 1
			})
			.sort({ updatedAt: -1 })
			.toArray()
	};
}
