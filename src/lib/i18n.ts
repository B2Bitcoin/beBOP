import { browser } from '$app/environment';
import { get } from 'lodash-es';
import { getContext } from 'svelte';
import { writable, get as storeGet } from 'svelte/store';

interface LocaleDictionary {
	[key: string]: LocaleDictionary | string;
}
type LocalesDictionary = {
	[key: string]: LocaleDictionary;
};

const locale = writable<string>('en');

const data: LocalesDictionary = {};

let languagesLoaded = false;

export function useI18n() {
	const language = getContext<string>('language');

	locale.set(language);

	if (browser) {
		if (!languagesLoaded) {
			const languages = 'language' in window ? (window.language as LocalesDictionary) : {};
			for (const entry of Object.entries(languages)) {
				addTranslations(entry[0], entry[1]);
			}
			languagesLoaded = true;
		}
	} else {
		// loaded in hooks.server.ts
	}

	return { t, locale };
}

export function t(key: string, params?: Record<string, string | number | undefined>) {
	let translation = get(data[storeGet(locale)], key) ?? get(data.en, key);

	if (typeof translation !== 'string') {
		if (params?.count) {
			translation = translation[params.count === 1 ? 'one' : params.count === 0 ? 'zero' : 'other'];
		}
	}

	if (typeof translation !== 'string') {
		return key;
	}

	return translation.replaceAll(/{(\w+)}/g, (_, key) => String(params?.[key] ?? `{${key}}`));
}

export function addTranslations(locale: string, translations: LocaleDictionary) {
	data[locale] = translations;
}
