import { runtimeConfig } from '$lib/server/runtime-config';

export async function load(event) {
	return {
		plausibleScriptUrl: runtimeConfig.plausibleScriptUrl,
		language: event.locals.language,
		themeChangeNumber: runtimeConfig.themeChangeNumber
	};
}
