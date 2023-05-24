import { NOSTR_PRIVATE_KEY } from '$env/static/private';
import { bech32 } from 'bech32';
import { getPublicKey } from '@noble/secp256k1';

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

	const publicKey = getPublicKey(new Uint8Array(Buffer.from(nostrPrivateKeyHex, 'hex'))).slice(1);

	nostrPublicKey = bech32.encode('npub', bech32.toWords(publicKey));
	nostrPublicKeyHex = nostrToHex(nostrPublicKey);
}

export function nostrToHex(key: string): string {
	return Buffer.from(bech32.fromWords(bech32.decode(key).words)).toString('hex');
}
