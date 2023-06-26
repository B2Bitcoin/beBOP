import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database.js';
import { isLightningConfigured, lndGetInfo } from '$lib/server/lightning.js';
import { nostrPrivateKey, nostrPublicKey, nostrRelays, nostrToHex } from '$lib/server/nostr';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { bech32 } from 'bech32';
import { ObjectId } from 'mongodb';
import { RelayPool } from 'nostr-relaypool';
import { Kind } from 'nostr-tools';
import { z } from 'zod';
import { setTimeout } from 'node:timers/promises';
import type { Event } from 'nostr-tools';
import { uniqBy } from '$lib/utils/uniqBy.js';

export function load() {
	return {
		origin: ORIGIN,
		nostrPrivateKey: nostrPrivateKey,
		nostrPublicKey: nostrPublicKey,
		nostrRelays: nostrRelays,
		receivedMessages: collections.nostrReceivedMessages
			.find({})
			.sort({ createdAt: -1 })
			.limit(100)
			.toArray()
	};
}

export const actions = {
	certify: async () => {
		const domainName = new URL(ORIGIN).hostname;

		const picture = runtimeConfig.logoPictureId
			? await collections.pictures.findOne({ _id: runtimeConfig.logoPictureId })
			: null;
		const pictureUrl = picture
			? `${ORIGIN}/picture/raw/${picture._id}/format/${
					picture.storage.formats.find((f) => f.width <= 512 || f.height <= 512)?.width
			  }`
			: null;

		const lndInfo = isLightningConfigured ? await lndGetInfo() : null;
		const lnAddress = lndInfo?.uris?.[0];

		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			content: JSON.stringify({
				name: runtimeConfig.brandName,
				display_name: runtimeConfig.brandName,
				website: ORIGIN,
				...(lnAddress && { lud16: lnAddress }),
				// about: '',
				...(runtimeConfig.logoPictureId && { picture: pictureUrl }),
				nip05: `${runtimeConfig.brandName}@${domainName}` //`_@${domainName}`
			}),
			createdAt: new Date(),
			updatedAt: new Date(),
			kind: Kind.Metadata
		});

		return {
			success:
				'Nostr Certification queued. When changing logo / brand name / ..., please certify again.'
		};
	},
	sendMessage: async ({ request }) => {
		const form = await request.formData();

		const { npub, message } = z
			.object({
				npub: z
					.string()
					.trim()
					.startsWith('npub')
					.refine((npubAddress) => bech32.decodeUnsafe(npubAddress, 90)?.prefix === 'npub', {
						message: 'Invalid npub address'
					}),
				message: z.string().trim().min(1)
			})
			.parse(Object.fromEntries(form));

		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			kind: Kind.EncryptedDirectMessage,
			content: message,
			dest: npub,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		return {
			success: 'Nostr Message queued'
		};
	},
	getMetadata: async ({ request }) => {
		const relayPool = new RelayPool(nostrRelays);

		const { npub } = z
			.object({
				npub: z
					.string()
					.startsWith('npub')
					.refine((npubAddress) => bech32.decodeUnsafe(npubAddress, 90)?.prefix === 'npub', {
						message: 'Invalid npub address'
					})
			})
			.parse(Object.fromEntries(await request.formData()));

		let metadata: Event[] = [];

		try {
			relayPool.subscribe(
				[
					{
						authors: [nostrToHex(npub)],
						kinds: [Kind.Metadata]
					}
				],
				nostrRelays,
				(event) => {
					metadata.push(event);
				}
			);

			await setTimeout(10_000);

			metadata = uniqBy(metadata, (event) => event.id);

			return {
				success: 'Nostr Metadata fetched',
				events: metadata
			};
		} finally {
			relayPool.close();
		}
	}
};
