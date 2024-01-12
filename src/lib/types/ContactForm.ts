import type { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface ContactFormTranslatableFields {
	title: string;
	content: string;
	subject: string;
}

export interface ContactForm extends Timestamps, ContactFormTranslatableFields {
	_id: string;
	target: string;
	translations?: Partial<Record<LanguageKey, Partial<ContactFormTranslatableFields>>>;
}
