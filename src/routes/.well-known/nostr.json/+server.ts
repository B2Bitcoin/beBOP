import { nostrPublicKeyHex } from '$lib/server/nostr';
import { error } from '@sveltejs/kit';

export const OPTIONS = () => {
	return new Response(null, {
		headers: {
			'access-control-allow-origin': '*',
			'access-control-allow-methods': 'GET, HEAD, OPTIONS',
			'access-control-allow-headers': 'Accept, Accept-Language, Content-Language, Content-Type'
		}
	});
};

export const GET = () => {
	if (!nostrPublicKeyHex) {
		throw error(404);
	}

	return new Response(
		JSON.stringify({
			names: {
				_: nostrPublicKeyHex
			}
		}),
		{
			headers: {
				'content-type': 'application/json'
			}
		}
	);
};
