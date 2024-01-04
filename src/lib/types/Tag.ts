import type { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface TagTranslatableFields {
	title: string;
	subtitle: string;
	content: string;
	shortContent: string;
	cta: {
		label: string;
		href: string;
	}[];
	menu: {
		label: string;
		href: string;
	}[];
}

export interface Tag extends Timestamps, TagTranslatableFields {
	_id: string;
	name: string;
	family: 'creators' | 'events' | 'retailers' | 'temporal';
	widgetUseOnly: boolean;
	productTagging: boolean;
	useLightDark: boolean;
	cssOveride: string;

	translations?: Partial<Record<LanguageKey, Partial<TagTranslatableFields>>>;
}
