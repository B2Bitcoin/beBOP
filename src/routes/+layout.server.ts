import { runtimeConfig, runtimeConfigUpdatedAt } from '$lib/server/runtime-config';

export async function load(event) {
	return {
		plausibleScriptUrl: runtimeConfig.plausibleScriptUrl,
		language: event.locals.language,
		themeChangeNumber: runtimeConfig.themeChangeNumber,
		languageUpdatedAt:
			runtimeConfigUpdatedAt[`translations.${event.locals.language}`] ?? new Date(0)
	};
}
