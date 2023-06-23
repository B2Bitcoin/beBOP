import type { ChangeStreamDocument } from 'mongodb';
import { Lock } from '../lock';
import { processClosed } from '../process';
import type { NostRNotification } from '$lib/types/NostRNotifications';
import {
	hexToNpub,
	nostrPrivateKeyHex,
	nostrPublicKeyHex,
	nostrRelays,
	nostrToHex
} from '../nostr';
import { fromUnixTime, getUnixTime, max } from 'date-fns';
import { collections } from '../database';
import { RelayPool } from 'nostr-relaypool';
import {
	getEventHash,
	getSignature,
	nip04,
	type Event,
	Kind,
	validateEvent,
	verifySignature
} from 'nostr-tools';

const lock = nostrPrivateKeyHex ? new Lock('notifications.nostr') : null;

let relayPool: RelayPool | null = null;

async function maintainLock() {
	while (!processClosed) {
		if (!lock?.ownsLock) {
			try {
				relayPool?.close();
			} catch (err) {
				console.error(err);
			}
			relayPool = null;
		} else if (!relayPool) {
			initRelayPool();
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

function initRelayPool() {
	if (relayPool) {
		return;
	}

	relayPool ||= new RelayPool(nostrRelays, { autoReconnect: true });

	console.log('subscribe', nostrPublicKeyHex);
	relayPool.subscribe(
		[
			// Messages sent to us
			{
				kinds: [Kind.EncryptedDirectMessage, Kind.Text],
				'#p': [nostrPublicKeyHex]
			}
		],
		nostrRelays,
		async (event /*, isAfterEose, relayURL*/) => {
			// isAfterEose = live event
			try {
				if (!validateEvent(event) || !verifySignature(event)) {
					return;
				}
				if (!event.tags.some((tag) => tag[0] === 'p' && tag[1] === nostrPublicKeyHex)) {
					return;
				}
				if (![Kind.EncryptedDirectMessage, Kind.Text].includes(event.kind)) {
					return;
				}

				await collections.nostrReceivedMessages.updateOne(
					{
						_id: event.id
					},
					{
						$setOnInsert: {
							createdAt: fromUnixTime(event.created_at),
							content:
								event.kind === Kind.EncryptedDirectMessage
									? await nip04.decrypt(nostrPrivateKeyHex, event.pubkey, event.content)
									: event.content,
							kind: event.kind,
							source: hexToNpub(event.pubkey),
							updatedAt: new Date()
						}
					},
					{
						upsert: true
					}
				);
			} catch (err) {
				console.error(err);
			}
		},
		undefined,
		undefined
	);
}

async function handleChanges(change: ChangeStreamDocument<NostRNotification>): Promise<void> {
	if (!lock?.ownsLock || !('fullDocument' in change)) {
		return;
	}

	const fullDocument = change.fullDocument;

	if (!fullDocument) {
		return;
	}

	if (fullDocument.processedAt) {
		return;
	}

	const event = await (async () => {
		const content = fullDocument.content;

		if (fullDocument.kind === Kind.Metadata) {
			return {
				id: '',
				content,
				created_at: getUnixTime(
					max([fullDocument.minCreatedAt ?? fullDocument.createdAt, fullDocument.createdAt])
				),
				pubkey: nostrPublicKeyHex,
				tags: [],
				kind: Kind.Metadata,
				sig: ''
			} satisfies Event;
		}

		if (fullDocument.kind === Kind.EncryptedDirectMessage) {
			const npub = fullDocument.dest;

			if (!npub) {
				return;
			}

			const receiverPublicKeyHex = nostrToHex(npub);

			return {
				id: '',
				content: await nip04.encrypt(nostrPrivateKeyHex, receiverPublicKeyHex, content),
				created_at: getUnixTime(
					max([fullDocument.minCreatedAt ?? fullDocument.createdAt, fullDocument.createdAt])
				),
				pubkey: nostrPublicKeyHex,
				tags: [['p', receiverPublicKeyHex]],
				kind: Kind.EncryptedDirectMessage,
				sig: ''
			} satisfies Event;
		}
	})();

	if (!event) {
		return;
	}

	event.id = getEventHash(event);
	event.sig = getSignature(event, nostrPrivateKeyHex);

	initRelayPool();
	relayPool?.publish(event, nostrRelays);

	await collections.nostrNotifications.updateOne(
		{ _id: fullDocument._id },
		{
			$set: {
				processedAt: new Date(),
				updatedAt: new Date()
			}
		}
	);
}

maintainLock().catch(console.error);

process.on('unhandledRejection', () => {
	// Happens because nostr-relaypool doesn't handle websocket upgrade errors for example
});
