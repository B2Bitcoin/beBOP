import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import type { Style } from '$lib/types/Style';

export const GET = async () => {
	const theme = await collections.styles.findOne({ _id: runtimeConfig.mainThemeId });
	const responseText = generateCss(theme, 'dark');
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

function generateCss(themeData: Style) {
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
  `;
}
