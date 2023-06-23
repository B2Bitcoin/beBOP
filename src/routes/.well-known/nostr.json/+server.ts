import { runtimeConfig } from '$lib/server/runtime-config';
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
	if (!runtimeConfig.nostrVerifiedName || !nostrPublicKeyHex) {
		throw error(404);
	}

	return new Response(
		JSON.stringify({
			names: {
				[runtimeConfig.nostrVerifiedName]: nostrPublicKeyHex
			}
		}),
		{
			headers: {
				'content-type': 'application/json'
			}
		}
	);
};
