import { collections } from '$lib/server/database.js';
import { nostrPrivateKey, nostrPublicKey, nostrRelays } from '$lib/server/nostr';
import { bech32 } from 'bech32';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

export function load() {
	return {
		nostrPrivateKey: nostrPrivateKey,
		nostrPublicKey: nostrPublicKey,
		nostrRelays: nostrRelays
	};
}

export const actions = {
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
			.parse({
				npub: form.get('npub'),
				message: form.get('message')
			});

		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
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
