import messages from '$lib/translations/fr.json';

const responseText = `window.language = window.language || {}; window.language['fr'] = ${JSON.stringify(
	messages
)};`;

export const GET = async () => {
	return new Response(responseText, {
		headers: {
			'Content-Type': 'application/javascript',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
