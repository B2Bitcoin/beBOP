import type { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface CountdownTranslatableFields {
	shortDescription: string;
	description: string;
}

export interface Countdown extends Timestamps, CountdownTranslatableFields {
	_id: string;
	title: string;
	beginsAt: Date;
	endsAt: Date;
	translations?: Partial<Record<LanguageKey, Partial<CountdownTranslatableFields>>>;
}
