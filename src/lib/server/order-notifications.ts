import type { Order } from '$lib/types/Order';
import type { ChangeStreamDocument } from 'mongodb';
import { collections } from './database';
import { encryptDm, calculateId, signId, RelayPool } from 'nostr';
import type { NostREvent } from 'nostr';
import { bech32 } from 'bech32';
import { NOSTR_PRIVATE_KEY, NOSTR_PUBLIC_KEY } from '$env/static/private';
import { getUnixTime } from 'date-fns';
import { Lock } from './lock';

const lock = new Lock('order-notifications');

const relays = [
	'wss://relay.nostr.info',
	'wss://nostr.blocs.fr',
	'wss://public.nostr.swissrouting.com'
];

// todo: only create / maintain one pool across all instances
const relayPool = new RelayPool(relays, { reconnect: true });

if (NOSTR_PRIVATE_KEY && NOSTR_PUBLIC_KEY) {
	if (bech32.decode(NOSTR_PRIVATE_KEY).prefix !== 'nsec') {
		throw new Error('Invalid NOSTR_PRIVATE_KEY');
	}
	if (bech32.decode(NOSTR_PUBLIC_KEY).prefix !== 'npub') {
		throw new Error('Invalid NOSTR_PUBLIC_KEY');
	}
}

function nostrToHex(key: string): string {
	return Buffer.from(bech32.decode(key).words).toString('hex');
}

// todo: resume changestream on restart if possible
collections.orders
	.watch([{ $match: { 'updateDescription.updatedFields.payment.status': { $exists: true } } }], {
		fullDocument: 'updateLookup'
	})
	.on('change', handleChanges);

async function handleChanges(change: ChangeStreamDocument<Order>): Promise<void> {
	if (
		!lock.ownsLock ||
		!('fullDocument' in change) ||
		!change.fullDocument ||
		!change.fullDocument.notifications?.paymentStatus?.npub ||
		!NOSTR_PRIVATE_KEY ||
		!NOSTR_PUBLIC_KEY
	) {
		return;
	}

	const { npub } = change.fullDocument.notifications.paymentStatus;

	const event: NostREvent = {
		id: '',
		content: encryptDm(
			nostrToHex(NOSTR_PRIVATE_KEY),
			nostrToHex(npub),
			`Order #${change.fullDocument.number} ${change.fullDocument.payment.status}, see ${change.fullDocument.url}`
		),
		created_at: getUnixTime(new Date()),
		pubkey: nostrToHex(NOSTR_PUBLIC_KEY),
		tags: [],
		kind: 1,
		sig: ''
	};

	event.id = await calculateId(event);
	event.sig = await signId(event.id, nostrToHex(NOSTR_PRIVATE_KEY));

	relayPool.send(['EVENT', event], relays);
}
