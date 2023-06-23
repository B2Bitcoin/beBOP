import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database.js';
import { isLightningConfigured, lndGetInfo } from '$lib/server/lightning.js';
import { nostrPrivateKey, nostrPublicKey, nostrRelays } from '$lib/server/nostr';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { bech32 } from 'bech32';
import { ObjectId } from 'mongodb';
import { Kind } from 'nostr-tools';
import { z } from 'zod';

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
				nip05: `_@${domainName}`
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
	}
};
