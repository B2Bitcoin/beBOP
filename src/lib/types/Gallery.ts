import type { LanguageKey } from '$lib/translations';
import type { Timestamps } from './Timestamps';

export interface GalleryBase {
	title: string;
	content: string;
	cta: {
		label: string;
		href: string;
		openNewTab?: boolean;
	};
	pictureId?: string;
}
export interface GalleryTranslatableFields {
	principal: GalleryBase;
	secondary: GalleryBase[];
}

export interface Gallery extends Timestamps, GalleryTranslatableFields {
	_id: string;
	name: string;
	translations?: Partial<Record<LanguageKey, Partial<GalleryTranslatableFields>>>;
}
