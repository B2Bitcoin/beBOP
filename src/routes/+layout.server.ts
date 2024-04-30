import { runtimeConfig, runtimeConfigUpdatedAt } from '$lib/server/runtime-config';

export async function load(event) {
	return {
		plausibleScriptUrl: runtimeConfig.plausibleScriptUrl,
		language: event.locals.language,
		themeChangeNumber: runtimeConfig.themeChangeNumber,
		enUpdatedAt: runtimeConfigUpdatedAt[`translations.en`] ?? new Date(0),
		faviconPictureId: runtimeConfig.faviconPictureId,
		languageUpdatedAt:
			runtimeConfigUpdatedAt[`translations.${event.locals.language}`] ?? new Date(0),
		websiteTitle:
			runtimeConfig[`translations.${event.locals.language}.config`]?.websiteTitle ||
			runtimeConfig.websiteTitle,
		websiteShortDescription:
			runtimeConfig[`translations.${event.locals.language}.config`]?.websiteShortDescription ||
			runtimeConfig.websiteShortDescription,
		viewportContentWidth: runtimeConfig.viewportContentWidth,
		viewportFor: runtimeConfig.viewportFor,
		roleId: event.locals.user?.roleId
	};
}
