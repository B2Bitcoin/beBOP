import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import type { Style } from '$lib/types/Style';
import { writeFile } from 'fs/promises';

const cache: Record<string, string> = {};

export const GET = async () => {
	let responseText = cache['css-generated'];
	const theme = await collections.styles.findOne({ _id: runtimeConfig.mainThemeId });

	const cssContentLight = theme ? generateCss(theme, 'light') : '';
	await writeFile(`static/generated-theme-light.css`, cssContentLight);

	const cssContentDark = theme ? generateCss(theme, 'dark') : '';
	await writeFile(`static/generated-theme-dark.css`, cssContentDark);

	return new Response(responseText, {
		headers: {
			'Content-Type': 'application/javascript; charset=utf-8',
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
	:root {
	${css}
  }
  body {
	@apply bg-[color:var(--body-mainBackgroundColor-${themeMode})] text-[color:var(--body-textFontColor-${themeMode})];
	/* Add other global styles here */
  }
  header {
	@apply bg-[color:var(--header-backgroundColor-${themeMode})];
  }
  header .shop-name {
	@apply text-[color:var(--header-shopNameFontColor-${themeMode})];
	font-family: var(--header-shopNameFont);
  }
  header .tab {
	@apply text-[color:var(--header-tabFontColor-${themeMode})];
	font-family: var(--header-tabFont);
  }
  header .active-tab {
	@apply border-b-[color:var(--header-activeTabUnderlineColor-${themeMode})] border-b border-solid;
  }
  navbar {
	@apply bg-[color:var(--navbar-backgroundColor-${themeMode})] text-[color:var(--header-fontColor-${themeMode})];
	font-family: var(--navbar-font);
  }
  navbar .search-input {
	@apply bg-[color:var(--navbar-searchInputBackgroundColor-${themeMode})];
  }
  footer {
	@apply bg-[color:var(--footer-backgroundColor-${themeMode})] text-[color:var(--footer-fontColor-${themeMode})];
	font-family: var(--footer-font);
  }
  .cart-preview {
	@apply bg-[color:var(--cartPreview-backgroundColor-${themeMode})] text-[color:var(--cartPreview-fontColor-${themeMode})];
	font-family: var(--cartPreview-font);
  }
  .cart-preview .cta {
	font-family: var(--cartPreview-CTAFont);
  }
  .cart-preview .main-cta {
	@apply bg-[color:var(--cartPreview-mainCTABackgroundColor-${themeMode})] text-[color:var(--cartPreview-mainCTAFontColor-${themeMode})] bg-[color:var(--cartPreview-secondaryCTABackgroundColor-${themeMode})] text-[color:var(--cartPreview-secondaryCTAFontColor-${themeMode})];
  }
  .tag-widget {
	@apply text-[color:var(--tagWidget-mainCTAFontColor-${themeMode})];
	font-family: var(--tagWidget-font);
  }
  .tag-widget .main {
	@apply bg-[color:var(--tagWidget-mainBackgroundColor-${themeMode})];
  }
  .tag-widget .transparent {
	@apply bg-[color:var(--tagWidget-transparentBackgroundColor-${themeMode})];
  }
  .tag-widget .secondary {
	@apply bg-[color:var(--tagWidget-secondaryBackgroundColor-${themeMode})];
  }
  .tag-widget .cta {
	@apply bg-[color:var(--tagWidget-CTABackgroundColor-${themeMode})] text-[color:var(--tagWidget-CTAFontColor-${themeMode})];
  }
  .tag-widget .hyperlink {
	@apply text-[color:var(--tagWidget-hyperlinkColor-${themeMode})];
  }
  `;
}
