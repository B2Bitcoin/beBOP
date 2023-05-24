import type { ChangeStreamDocument } from 'mongodb';
import { Lock } from './lock';
import { processClosed } from './process';
import type { NostRNotification } from '$lib/types/NostRNotifications';
import { nostrPrivateKeyHex, nostrPublicKeyHex, nostrRelays, nostrToHex } from './nostr';
import { getUnixTime } from 'date-fns';
import { collections } from './database';
import { RelayPool } from 'nostr-relaypool';
import { getEventHash, getSignature, nip04, type Event } from 'nostr-tools';

const lock = new Lock('notifications.nostr');

let relayPool: RelayPool | null = null;

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

if (nostrPrivateKeyHex) {
	// todo: resume changestream on restart if possible
	collections.nostrNotifications
		.watch([{ $match: { operationType: 'insert' } }], {
			fullDocument: 'updateLookup'
		})
		.on('change', (ev) => handleChanges(ev).catch(console.error));
}

async function handleChanges(change: ChangeStreamDocument<NostRNotification>): Promise<void> {
	if (!lock.ownsLock || !('fullDocument' in change) || !change.fullDocument) {
		return;
	}

	if (change.fullDocument.processedAt) {
		return;
	}

	const npub = change.fullDocument.dest;
	const content = change.fullDocument.content;
	const receiverPublicKeyHex = nostrToHex(npub);

	const event = {
		id: '',
		content: await nip04.encrypt(nostrPrivateKeyHex, receiverPublicKeyHex, content),
		created_at: getUnixTime(change.fullDocument.createdAt),
		pubkey: nostrPublicKeyHex,
		tags: [['p', receiverPublicKeyHex]],
		kind: 4,
		sig: ''
	} satisfies Event;

	event.id = getEventHash(event);
	event.sig = getSignature(event, nostrPrivateKeyHex);

	relayPool ||= new RelayPool();
	relayPool.publish(event, nostrRelays);

	await collections.nostrNotifications.updateOne(
		{ _id: change.fullDocument._id },
		{
			$set: {
				processedAt: new Date(),
				updatedAt: new Date()
			}
		}
	);
}

maintainLock().catch(console.error);

process.on('unhandledRejection', (err) => {
	if (err instanceof ErrorEvent) {
		// Happens because nostr-relaypool doesn't handled websocket upgrade errors for example
	} else {
		console.error('unhandledrejection', err);
	}
});
