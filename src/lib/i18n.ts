import { browser } from '$app/environment';
import { getContext } from 'svelte';
import { addMessages, locale, init } from 'svelte-i18n';
import { get } from 'svelte/store';
import { languageLoaded } from './stores/languageLoaded';

interface LocaleDictionary {
	[key: string]: LocaleDictionary | string | Array<string | LocaleDictionary> | null;
}
type LocalesDictionary = {
	[key: string]: LocaleDictionary;
};

let isInit = false;

export function useI18n() {
	if (!isInit) {
		init({
			fallbackLocale: 'en'
		});
		isInit = true;
	}

	const language = getContext<string>('language');

	if (browser) {
		if (!get(languageLoaded)) {
			const languages = 'language' in window ? (window.language as LocalesDictionary) : {};
			for (const entry of Object.entries(languages)) {
				console.log('loading language', entry[0]);
				addMessages(entry[0], entry[1]);
			}
			languageLoaded.set(true);
		}
	} else {
		// loaded in hooks.server.ts
	}

	locale.set(language);
}
