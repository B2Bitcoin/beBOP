import type { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface CountdownTranslatableFields {
	title: string;
	description: string;
}

export interface Countdown extends Timestamps, CountdownTranslatableFields {
	_id: string;
	name: string;
	endsAt: Date;
	translations?: Partial<Record<LanguageKey, Partial<CountdownTranslatableFields>>>;
}
