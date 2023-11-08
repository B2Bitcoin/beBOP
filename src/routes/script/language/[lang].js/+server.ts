import { languages } from '$lib/translations';
import { typedInclude } from '$lib/utils/typedIncludes.js';
import { typedKeys } from '$lib/utils/typedKeys.js';

const cache: Record<string, string> = {};

export const GET = async ({ params }) => {
	if (!typedInclude(typedKeys(languages), params.lang)) {
		return new Response('Not found', { status: 404 });
	}

	let responseText = cache[params.lang];

	if (!responseText) {
		const messages = languages[params.lang];
		responseText = `window.language = window.language || {}; window.language['${
			params.lang
		}'] = ${JSON.stringify(messages)};`;
		cache[params.lang] = responseText;
	}

	return new Response(responseText, {
		headers: {
			'Content-Type': 'application/javascript',
			...(import.meta.env.DEV
				? {}
				: {
						'Cache-Control': 'public, max-age=31536000, immutable'
				  })
		}
	});
};
