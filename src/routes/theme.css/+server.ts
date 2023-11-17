import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import type { Style } from '$lib/types/Style';

export const GET = async () => {
	const theme = await collections.styles.findOne({ _id: runtimeConfig.mainThemeId });
	console.log('hello' + theme);

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

	return `
	:root {${css}}
		body .secondPlan {
		@apply bg-[color:var(--body-secondPlan-backgroundColor-${themeMode})];
		}
		body .mainPlan {
		@apply bg-[color:var(--body-mainPlan-backgroundColor-dark)];
		}
		body title {
		@apply text-[color:var(--body-title-color-dark)];
		font-family: var(--body-title-fontFamily);
		}
		body {
		@apply text-[color:var(--body-text-color-dark)];
		font-family: var(--body-text-fontFamily);
		}
		body .secondaryText {
		@apply text-[color:var(--body-secondaryText-color-dark)];
		font-family: var(--body-secondaryText-fontFamily);
		}
		body .mainCTA {
		@apply bg-[color:var(--body-mainCTA-backgroundColor-dark)] text-[color:var(--body-mainCTA-color-dark)];
		}
		body .secondaryCTA {
		@apply bg-[color:var(--body-secondaryCTA-backgroundColor-dark)] text-[color:var(--body-secondaryCTA-color-dark)];
		}
		body .cta {
		font-family: var(--body-cta-fontFamily);
		}
		body .hyperlink {
		@apply text-[color:var(--body-hyperlink-color-dark)];
		}
		--header-backgroundColor-light:FFFFFF;
--header-backgroundColor-dark:FFFFFF;
--header-shopName-fontFamily:Arial;
--header-shopName-color-light:FFFFFF;
--header-shopName-color-dark:FFFFFF;
--header-tab-fontFamily:Helvetica;
--header-tab-color-light:FFFFFF;
--header-tab-color-dark:FFFFFF;
--header-activeTabUnderline-color-light:FFFFFF;
--header-activeTabUnderline-color-dark:FFFFFF;

		header {
		@apply bg-[color:var(--header-backgroundColor-dark)]
		}
		header .shopName {
			font-family: var(--header-shopName-fontFamily);
			@apply text-[color:var(--header-shopName-color-dark)]
			}

 	 `;
}
