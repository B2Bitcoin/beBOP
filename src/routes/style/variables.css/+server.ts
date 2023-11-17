import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { themeValidator, type ThemeData } from '$lib/server/theme.js';
import { trimSuffix } from '$lib/utils/trimSuffix.js';
import { flatten } from 'flat';

let cache = '';
let cacheId = -1;

export const GET = async ({}) => {
	if (cacheId !== runtimeConfig.themeChangeNumber) {
		const theme = await collections.themes.findOne({ _id: runtimeConfig.mainThemeId });
		cache = theme ? generateCss(theme) : '';
		cacheId = runtimeConfig.themeChangeNumber;
	}

	return new Response(cache, {
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
	.map(([key, value]) => `\t--${key.replaceAll('.', '-')}:${value};`)
	.join('\n')}
${Object.entries(lightModeColors)
	.map(([key, value]) => `\t--${key.replaceAll('.', '-')}:${value};`)
	.join('\n')}
}

html.dark {
${Object.entries(darkModeColors)
	.map(([key, value]) => `\t--${key.replaceAll('.', '-')}:${value};`)
	.join('\n')}
}`;
}
