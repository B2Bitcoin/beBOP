import { runtimeConfig, runtimeConfigUpdatedAt } from '$lib/server/runtime-config';
import { CUSTOMER_ROLE_ID } from '$lib/types/User';

export async function load(event) {
	let viewportWidth;
	if (runtimeConfig.viewportFor === 'everyone') {
		viewportWidth = 'width=device-width';
	} else if (
		event.locals.user?.roleId !== CUSTOMER_ROLE_ID &&
		runtimeConfig.viewportFor === 'employee'
	) {
		viewportWidth = 'width=device-width';
	} else if (
		event.locals.user?.roleId === CUSTOMER_ROLE_ID &&
		runtimeConfig.viewportFor === 'visitors'
	) {
		viewportWidth = 'width=device-width';
	} else {
		viewportWidth = runtimeConfig.viewportContentWidth;
	}

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
		viewportWidth
	};
}
