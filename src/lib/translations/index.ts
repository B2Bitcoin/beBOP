import { merge } from 'lodash-es';
import en from './en.json';
import es_sv from './es-sv.json';
import fr from './fr.json';
import nl from './nl.json';
import { typedKeys } from '$lib/utils/typedKeys';

export const languages = {
	en,
	'es-sv': es_sv,
	fr,
	nl
};

export const enhancedLanguages = merge({}, languages);

export const locales = typedKeys(languages);

export type LanguageKey = keyof typeof languages;

export const languageNames: Record<LanguageKey, string> = {
	en: 'English',
	'es-sv': 'Español (El Salvador)',
	fr: 'Français',
	nl: 'Nederlands'
};
