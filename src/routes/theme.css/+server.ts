import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import type { Style } from '$lib/types/Style';

export const GET = async () => {
	const theme = await collections.styles.findOne({ _id: runtimeConfig.mainThemeId });
	const responseText = theme ? generateCss(theme, 'dark') : '';
	return new Response(responseText, {
		headers: {
			'Content-Type': 'text/css',
			...(import.meta.env.DEV
				? {}
				: {
						'Cache-Control': 'public, max-age=31536000, immutable'
				  })
		}
	});
};

function generateCss(themeData: Style, themeMode: string) {
	let css = '';

	function processStyleObject(styleObject: Style, prefix = '') {
		for (const [key, value] of Object.entries(styleObject)) {
			if (typeof value === 'object') {
				processStyleObject(value, `${prefix}${key}-`);
			} else {
				css += `--${prefix}${key}:${value};\n`;
			}
		}
	}

	processStyleObject(themeData);

	return `:root ${css}
		body .secondPlan {
			@apply bg-[color:var(--body-secondPlan-backgroundColor-${themeMode})];
		}
		body .mainPlan {
			@apply bg-[color:var(--body-mainPlan-backgroundColor-${themeMode})];
		}
		body title {
			@apply text-[color:var(--body-title-color-${themeMode})];
			font-family: var(--body-title-fontFamily);
		}
		body {
			@apply text-[color:var(--body-text-color-${themeMode})];
			font-family: var(--body-text-fontFamily);
		}
		body .secondaryText {
			@apply text-[color:var(--body-secondaryText-color-${themeMode})];
			font-family: var(--body-secondaryText-fontFamily);
		}
		body .mainCTA {
			@apply bg-[color:var(--body-mainCTA-backgroundColor-${themeMode})] text-[color:var(--body-mainCTA-color-${themeMode})];
		}
		body .secondaryCTA {
			@apply bg-[color:var(--body-secondaryCTA-backgroundColor-${themeMode})] text-[color:var(--body-secondaryCTA-color-${themeMode})];
		}
		body .cta {
			font-family: var(--body-cta-fontFamily);
		}
		body .hyperlink {
			@apply text-[color:var(--body-hyperlink-color-${themeMode})];
		}
		header {
			@apply bg-[color:var(--header-backgroundColor-${themeMode})]
		}
		header .shopName {
			font-family: var(--header-shopName-fontFamily);
			@apply text-[color:var(--header-shopName-color-${themeMode})]
		}
		header .tab {
			font-family: var(--header-tab-fontFamily);
			@apply text-[color:var(--header-tab-color-${themeMode})]
		}
		header .activeTab {
			text-decoration: underline --header-activeTab-textDecoration-color-${themeMode};
		}
		navbar {
			@apply bg-[color:var(--navbar-backgroundColor-${themeMode})]
			font-family: var(--navbar-fontFamily);
			@apply text-[color:var(--navbar-color-${themeMode})];
		}
		navbar .searchInput {
			@apply bg-[color:var(--navbar-searchInput-backgroundColor-${themeMode})]
		}
		footer {
			@apply bg-[color:var(--footer-backgroundColor-${themeMode})]
			font-family: var(--footer-fontFamily);
			@apply text-[color:var(--footer-color-${themeMode})];
		}

		cartPreview {
			@apply bg-[color:var(--cartPreview-backgroundColor-${themeMode})]
			font-family: var(--cartPreview-fontFamily);
			@apply text-[color:var(--cartPreview-color-${themeMode})]
		}
		cartPreview .cta{
			font-family: var(--cartPreview-cta-fontFamily);
		}
		cartPreview .mainCTA {
			@apply bg-[color:var(--cartPreview-mainCTA-backgroundColor-${themeMode})]
			@apply text-[color:var(--cartPreview-mainCTA-color-${themeMode})]
		}
		cartPreview .secondaryCTA {
			@apply bg-[color:var(--cartPreview-secondaryCTA-backgroundColor-${themeMode})]
			@apply text-[color:var(--cartPreview-secondaryCTA-color-${themeMode})]
		}
		tagWidget {
			font-family: var(--tagWidget-fontFamily);
			@apply text-[color:var(--tagWidget-color-${themeMode})]
		}
		tagWidget .main{
			@apply bg-[color:var(--tagWidget-main-backgroundColor-${themeMode})]
		}
		tagWidget .transparent{
			@apply bg-[color:var(--tagWidget-transparent-backgroundColor-${themeMode})]
		}
		tagWidget .secondary{
			@apply bg-[color:var(--tagWidget-secondary-backgroundColor-${themeMode})]
		}
		tagWidget .cta{
			@apply bg-[color:var(--tagWidget-cta-backgroundColor-${themeMode})]
			@apply text-[color:var(--tagWidget-cta-color-${themeMode})]

		}
		tagWidget .hyperlink{
			@apply text-[color:var(--tagWidget-hyperlink-${themeMode})]
		}
 	 `;
}
