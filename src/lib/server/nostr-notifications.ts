import type { ChangeStreamDocument } from 'mongodb';
import { Lock } from './lock';
import { processClosed } from './process';
import { RelayPool, encryptDm, calculateId, signId } from 'nostr';
import type { NostREvent } from 'nostr';
import type { NostRNotification } from '$lib/types/NostRNotifications';
import { nostrPrivateKeyHex, nostrPublicKeyHex, nostrRelays, nostrToHex } from './nostr';
import { getUnixTime } from 'date-fns';
import { collections } from './database';

const lock = new Lock('nostr-notifications');

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

	const event: NostREvent = {
		id: '',
		content: encryptDm(nostrPrivateKeyHex, nostrToHex(npub), content),
		created_at: getUnixTime(change.fullDocument.createdAt),
		pubkey: nostrPublicKeyHex,
		tags: [],
		kind: 1,
		sig: ''
	};

	event.id = await calculateId(event);
	event.sig = await signId(event.id, nostrPrivateKeyHex);

	relayPool ||= new RelayPool(nostrRelays, { reconnect: true });
	relayPool.send(['EVENT', event]);

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
