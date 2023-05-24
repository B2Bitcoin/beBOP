import { nostrPrivateKey, nostrPublicKey } from '$lib/server/nostr';

export function load() {
	return {
		nostrPrivateKey: nostrPrivateKey,
		nostrPublicKey: nostrPublicKey
	};
}
