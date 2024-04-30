import { runtimeConfig, runtimeConfigUpdatedAt } from '$lib/server/runtime-config';
import { CUSTOMER_ROLE_ID, POS_ROLE_ID, SUPER_ADMIN_ROLE_ID } from '$lib/types/User';

export async function load(event) {
	const viewportWidth = (() => {
		switch (runtimeConfig.viewportFor) {
			case 'everyone':
				return 'width=device-width';
			case 'employee':
				return event.locals.user?.roleId !== CUSTOMER_ROLE_ID
					? 'width=device-width'
					: runtimeConfig.viewportContentWidth;
			case 'visitors':
				return event.locals.user?.roleId !== POS_ROLE_ID &&
					event.locals.user?.roleId !== SUPER_ADMIN_ROLE_ID
					? 'width=device-width'
					: runtimeConfig.viewportContentWidth;
			default:
				return runtimeConfig.viewportContentWidth;
		}
	})();

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
