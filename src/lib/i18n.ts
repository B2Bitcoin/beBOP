import { browser } from '$app/environment';
import { getContext } from 'svelte';
// @ts-expect-error - using dist import :(
import { I18n } from 'i18n-js/dist/require';
import type { I18n as RealType } from 'i18n-js';

interface LocaleDictionary {
	[key: string]: LocaleDictionary | string | Array<string | LocaleDictionary> | null;
}
type LocalesDictionary = {
	[key: string]: LocaleDictionary;
};

const i18n = new I18n() as RealType;

i18n.defaultLocale = 'en';

let languagesLoaded = false;

export function useI18n() {
	const language = getContext<string>('language');

	i18n.locale = language;

	if (browser) {
		if (!languagesLoaded) {
			const languages = 'language' in window ? (window.language as LocalesDictionary) : {};
			for (const entry of Object.entries(languages)) {
				console.log('loading language', entry[0]);
				i18n.store({
					[entry[0]]: entry[1]
				});
			}
			languagesLoaded = true;
		}
	} else {
		// loaded in hooks.server.ts
	}
}

const t = i18n.t.bind(i18n);

export { t, i18n };
