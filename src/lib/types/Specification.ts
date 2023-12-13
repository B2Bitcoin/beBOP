import type { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface SpecificationTranslatableFields {
	title: string;
	content: string;
}

export interface Specification extends Timestamps, SpecificationTranslatableFields {
	_id: string;

	translations?: Partial<Record<LanguageKey, Partial<SpecificationTranslatableFields>>>;
}
