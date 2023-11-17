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
	@import 'tailwindcss/base';
	@import 'tailwindcss/components';
	@import 'tailwindcss/utilities';

	:root {${css}}
 
	body .secondPlan {
		background-color: var(--body-secondPlan-backgroundColor-${themeMode});
	  }
	  
	  body .mainPlan {
		background-color: var(--body-mainPlan-backgroundColor-${themeMode});
	  }
	  
	  body title {
		font-family: var(--body-title-fontFamily);
		color: var(--body-title-color-${themeMode});
	  }
	  
	  body .text {
		font-family: var(--body-text-fontFamily);
	  }
	  
	  body .secondaryText {
		font-family: var(--body-secondaryText-fontFamily);
		color: var(--body-secondaryText-color-${themeMode});
	  }
	  
	  body .mainCTA {
		background-color: var(--body-mainCTA-backgroundColor-${themeMode});
		color: var(--body-mainCTA-color-${themeMode});
	  }
	  
	  body .secondaryCTA {
		background-color: var(--body-secondaryCTA-backgroundColor-${themeMode});
		color: var(--body-secondaryCTA-color-${themeMode});
	  }
	  
	  body .cta {
		font-family: var(--body-cta-fontFamily);
	  }
	  
	  body .hyperlink {
		color: var(--body-hyperlink-color-${themeMode});
	  }
 	 `;
}
