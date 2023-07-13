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
import { NOSTR_PROTOCOL_VERSION } from './handle-messages';

const lock = nostrPrivateKeyHex ? new Lock('notifications.nostr') : null;
const processingIds = new Set<string>();

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
	if (lock) {
		lock.onAcquire = async () => {
			const unprocessedNotifications = collections.nostrNotifications.find({
				processedAt: { $exists: false }
			});

			for await (const notification of unprocessedNotifications) {
				await handleNostrNotification(notification);
			}
		};
	}

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
							tags: event.tags,
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

	await handleNostrNotification(fullDocument);
}

async function handleNostrNotification(nostrNotification: NostRNotification): Promise<void> {
	if (nostrNotification.processedAt || processingIds.has(nostrNotification._id.toHexString())) {
		return;
	}

	try {
		processingIds.add(nostrNotification._id.toHexString());

		const updatedNotification = await collections.nostrNotifications.findOne({
			_id: nostrNotification._id
		});

		if (!updatedNotification || updatedNotification.processedAt) {
			return;
		}

		nostrNotification = updatedNotification;

		const event = await (async () => {
			const content = nostrNotification.content;

			if (nostrNotification.kind === Kind.Metadata) {
				return {
					id: '',
					content,
					created_at: getUnixTime(
						max([
							nostrNotification.minCreatedAt ?? nostrNotification.createdAt,
							nostrNotification.createdAt
						])
					),
					pubkey: nostrPublicKeyHex,
					tags: [],
					kind: Kind.Metadata,
					sig: ''
				} satisfies Event;
			}

			if (nostrNotification.kind === Kind.EncryptedDirectMessage) {
				const npub = nostrNotification.dest;

				if (!npub) {
					return;
				}

				const receiverPublicKeyHex = nostrToHex(npub);

				return {
					id: '',
					content: await nip04.encrypt(nostrPrivateKeyHex, receiverPublicKeyHex, content),
					created_at: getUnixTime(
						max([
							nostrNotification.minCreatedAt ?? nostrNotification.createdAt,
							nostrNotification.createdAt
						])
					),
					pubkey: nostrPublicKeyHex,
					tags: [
						['p', receiverPublicKeyHex],
						['bootikVersion', String(NOSTR_PROTOCOL_VERSION)]
					],
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
			{ _id: nostrNotification._id },
			{
				$set: {
					processedAt: new Date(),
					updatedAt: new Date()
				}
			}
		);
	} finally {
		processingIds.delete(nostrNotification._id.toHexString());
	}
}

maintainLock().catch(console.error);

process.on('unhandledRejection', () => {
	// Happens because nostr-relaypool doesn't handle websocket upgrade errors for example
});
