import type { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface ContactFormTranslatableFields {
	content: string;
	subject: string;
}

export interface ContactForm extends Timestamps, ContactFormTranslatableFields {
	_id: string;
	title: string;
	target: string;
	displayFromField?: boolean;
	prefillWithSession?: boolean;
	translations?: Partial<Record<LanguageKey, Partial<ContactFormTranslatableFields>>>;
}
