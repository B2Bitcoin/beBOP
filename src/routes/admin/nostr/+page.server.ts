import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database.js';
import { nostrPrivateKey, nostrPublicKey, nostrRelays } from '$lib/server/nostr';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { bech32 } from 'bech32';
import { ObjectId } from 'mongodb';
import { Kind } from 'nostr-tools';
import { z } from 'zod';

export function load() {
	return {
		origin: ORIGIN,
		nostrVerifiedName: runtimeConfig.nostrVerifiedName,
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
	setVerifiedName: async ({ request }) => {
		const domainName = new URL(ORIGIN).hostname;

		const form = await request.formData();

		const { verifiedName } = z
			.object({
				verifiedName: z.string().trim().min(1)
			})
			.parse(Object.fromEntries(form));

		await collections.runtimeConfig.updateOne(
			{ _id: 'nostrVerifiedName' },
			{
				$set: {
					data: verifiedName,
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);

		runtimeConfig.nostrVerifiedName = verifiedName;

		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			content: JSON.stringify({
				name: verifiedName,
				nip05: `${verifiedName}@${domainName}`
			}),
			createdAt: new Date(),
			updatedAt: new Date(),
			kind: Kind.Metadata
		});

		return {
			success: 'Verified name updated'
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
