import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { themeValidator, type ThemeData } from '$lib/server/theme.js';
import { trimSuffix } from '$lib/utils/trimSuffix.js';
import { flatten } from 'flat';

export const GET = async ({}) => {
	const theme = await collections.themes.findOne({ _id: runtimeConfig.mainThemeId });
	const responseText = theme ? generateCss(theme) : '';
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

function generateVariables(themeData: ThemeData) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { name, ...validated } = themeValidator.parse(themeData);
	const flattened = flatten(validated) as Record<string, string>;

	const nonColors: Record<string, string> = {};
	const darkModeColors: Record<string, string> = {};
	const lightModeColors: Record<string, string> = {};

	for (const [key, value] of Object.entries(flattened)) {
		if (!key.endsWith('.light') && !key.endsWith('.dark')) {
			nonColors[key] = value;
		} else if (key.endsWith('.light')) {
			lightModeColors[trimSuffix(key, '.light')] = value;
		} else if (key.endsWith('.dark')) {
			darkModeColors[trimSuffix(key, '.dark')] = value;
		}
	}

	return {
		nonColors,
		darkModeColors,
		lightModeColors
	};
}

function generateCss(themeData: ThemeData) {
	const { nonColors, darkModeColors, lightModeColors } = generateVariables(themeData);

	return `html {
		${Object.entries(nonColors)
			.map(([key, value]) => `--${key.replaceAll('.', '-')}:${value};`)
			.join('\n')}
		${Object.entries(lightModeColors)
			.map(([key, value]) => `--${key.replaceAll('.', '-')}:${value};`)
			.join('\n')}
	}

	html.dark {
		${Object.entries(darkModeColors)
			.map(([key, value]) => `--${key.replaceAll('.', '-')}:${value};`)
			.join('\n')}
	}

		body .secondPlan {
			@apply bg-[color:var(--body-secondPlan-backgroundColor)];
		}
		body .mainPlan {
			@apply bg-[color:var(--body-mainPlan-backgroundColor)];
		}
		body title {
			@apply text-[color:var(--body-title-color)];
			font-family: var(--body-title-fontFamily);
		}
		body {
			@apply text-[color:var(--body-text-color)];
			font-family: var(--body-text-fontFamily);
		}
		body .secondaryText {
			@apply text-[color:var(--body-secondaryText-color)];
			font-family: var(--body-secondaryText-fontFamily);
		}
		body .mainCTA {
			@apply bg-[color:var(--body-mainCTA-backgroundColor)] text-[color:var(--body-mainCTA-color)];
		}
		body .secondaryCTA {
			@apply bg-[color:var(--body-secondaryCTA-backgroundColor)] text-[color:var(--body-secondaryCTA-color)];
		}
		body .cta {
			font-family: var(--body-cta-fontFamily);
		}
		body .hyperlink {
			@apply text-[color:var(--body-hyperlink-color)];
		}
		header {
			@apply bg-[color:var(--header-backgroundColor)]
		}
		header .shopName {
			font-family: var(--header-shopName-fontFamily);
			@apply text-[color:var(--header-shopName-color)]
		}
		header .tab {
			font-family: var(--header-tab-fontFamily);
			@apply text-[color:var(--header-tab-color)]
		}
		header .activeTab {
			text-decoration: underline --header-activeTab-textDecoration-color;
		}
		navbar {
			@apply bg-[color:var(--navbar-backgroundColor)]
			font-family: var(--navbar-fontFamily);
			@apply text-[color:var(--navbar-color)];
		}
		navbar .searchInput {
			@apply bg-[color:var(--navbar-searchInput-backgroundColor)]
		}
		footer {
			@apply bg-[color:var(--footer-backgroundColor)]
			font-family: var(--footer-fontFamily);
			@apply text-[color:var(--footer-color)];
		}

		cartPreview {
			@apply bg-[color:var(--cartPreview-backgroundColor)]
			font-family: var(--cartPreview-fontFamily);
			@apply text-[color:var(--cartPreview-color)]
		}
		cartPreview .cta {
			font-family: var(--cartPreview-cta-fontFamily);
		}
		cartPreview .mainCTA {
			@apply bg-[color:var(--cartPreview-mainCTA-backgroundColor)]
			@apply text-[color:var(--cartPreview-mainCTA-color)]
		}
		cartPreview .secondaryCTA {
			@apply bg-[color:var(--cartPreview-secondaryCTA-backgroundColor)]
			@apply text-[color:var(--cartPreview-secondaryCTA-color)]
		}
		tagWidget {
			font-family: var(--tagWidget-fontFamily);
			@apply text-[color:var(--tagWidget-color)]
		}
		tagWidget .main {
			@apply bg-[color:var(--tagWidget-main-backgroundColor)]
		}
		tagWidget .transparent {
			@apply bg-[color:var(--tagWidget-transparent-backgroundColor)]
		}
		tagWidget .secondary {
			@apply bg-[color:var(--tagWidget-secondary-backgroundColor)]
		}
		tagWidget .cta {
			@apply bg-[color:var(--tagWidget-cta-backgroundColor)]
			@apply text-[color:var(--tagWidget-cta-color)]

		}
		tagWidget .hyperlink{
			@apply text-[color:var(--tagWidget-hyperlink)]
		}
 	 `;
}
