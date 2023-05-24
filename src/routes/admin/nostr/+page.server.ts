import { nostrPrivateKey, nostrPublicKey, nostrRelays } from '$lib/server/nostr';

export function load() {
	return {
		nostrPrivateKey: nostrPrivateKey,
		nostrPublicKey: nostrPublicKey,
		nostrRelays: nostrRelays
	};
}
