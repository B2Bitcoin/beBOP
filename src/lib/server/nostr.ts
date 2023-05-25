import { NOSTR_PRIVATE_KEY } from '$env/static/private';
import { bech32 } from 'bech32';
import { getPublicKey } from 'nostr-tools';

export const nostrPrivateKey = NOSTR_PRIVATE_KEY;
export let nostrPublicKey = '';
export let nostrPrivateKeyHex = '';
export let nostrPublicKeyHex = '';

if (NOSTR_PRIVATE_KEY) {
	const decoded = bech32.decode(NOSTR_PRIVATE_KEY);
	if (decoded.prefix !== 'nsec') {
		throw new Error('Invalid NOSTR_PRIVATE_KEY');
	}

	nostrPrivateKeyHex = nostrToHex(NOSTR_PRIVATE_KEY);

	const publicKey = getPublicKey(nostrPrivateKeyHex);

	nostrPublicKey = bech32.encode('npub', bech32.toWords(Buffer.from(publicKey, 'hex')));
	nostrPublicKeyHex = nostrToHex(nostrPublicKey);
}

export function nostrToHex(key: string): string {
	return Buffer.from(bech32.fromWords(bech32.decode(key).words)).toString('hex');
}

export const nostrRelays = [
	'wss://nostr.wine',
	'wss://nostr.lu.ke',
	'wss://nos.lol',
	'wss://relay.snort.social',
	'wss://relay.nostr.ch'
];
