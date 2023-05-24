import type { Order } from '$lib/types/Order';
import type { ChangeStreamDocument } from 'mongodb';
import { collections } from './database';
import { encryptDm, calculateId, signId, RelayPool } from 'nostr';
import type { NostREvent } from 'nostr';
import { processClosed } from './process';
import { getUnixTime } from 'date-fns';
import { Lock } from './lock';
import { nostrPrivateKeyHex, nostrToHex, nostrPublicKeyHex, nostrRelays } from './nostr';

const lock = new Lock('order-notifications');

let relayPool: RelayPool | null = null;

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
		!nostrPrivateKeyHex
	) {
		return;
	}

	const { npub } = change.fullDocument.notifications.paymentStatus;

	const event: NostREvent = {
		id: '',
		content: encryptDm(
			nostrPrivateKeyHex,
			nostrToHex(npub),
			`Order #${change.fullDocument.number} ${change.fullDocument.payment.status}, see ${change.fullDocument.url}`
		),
		created_at: getUnixTime(new Date()),
		pubkey: nostrPublicKeyHex,
		tags: [],
		kind: 1,
		sig: ''
	};

	event.id = await calculateId(event);
	event.sig = await signId(event.id, nostrPrivateKeyHex);

	relayPool ||= new RelayPool(nostrRelays, { reconnect: true });
	relayPool.send(['EVENT', event]);
}

async function maintainLock() {
	while (!processClosed) {
		if (!lock.ownsLock) {
			try {
				relayPool?.close();
			} catch (err) {
				console.error(err);
			}
			relayPool = null;
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
}

maintainLock().catch(console.error);
