import { runtimeConfig, runtimeConfigUpdatedAt } from '$lib/server/runtime-config';

export async function load(event) {
	return {
		plausibleScriptUrl: runtimeConfig.plausibleScriptUrl,
		language: event.locals.language,
		themeChangeNumber: runtimeConfig.themeChangeNumber,
		enUpdatedAt: runtimeConfigUpdatedAt[`translations.en`] ?? new Date(0),
		languageUpdatedAt:
			runtimeConfigUpdatedAt[`translations.${event.locals.language}`] ?? new Date(0)
	};
}
