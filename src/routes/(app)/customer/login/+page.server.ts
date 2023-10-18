import { collections } from '$lib/server/database';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { addMinutes } from 'date-fns';
import { sendAuthentificationlink } from '$lib/server/sendNotification';
import { ObjectId } from 'mongodb';
import { bech32 } from 'bech32';

export const load = async () => {};

export const actions = {
	default: async function ({ request, locals }) {
		const data = await request.formData();
		const { address } = z
			.object({
				address: z.union([
					z.string().email(),
					z
						.string()
						.startsWith('npub')
						.refine((npubAddress) => bech32.decodeUnsafe(npubAddress, 90)?.prefix === 'npub', {
							message: 'Invalid npub address'
						})
				])
			})
			.parse({
				address: data.get('address')
			});

		await collections.sessions.deleteOne({ sessionId: locals.sessionId });
		const session = await collections.sessions.insertOne({
			_id: new ObjectId(),
			...(address.includes('@') && { email: address }),
			...(!address.includes('@') && { npub: address }),
			authLink: { token: crypto.randomUUID(), expiresAt: addMinutes(new Date(), 60) },
			sessionId: locals.sessionId,
			expiresAt: addMinutes(new Date(), 60),
			createdAt: new Date(),
			updatedAt: new Date()
		});
		const sessionCreated = await collections.sessions.findOne({ _id: session.insertedId });
		if (sessionCreated) {
			await sendAuthentificationlink(sessionCreated);
			return { address, successUser: true };
		} else {
			return fail(400, { fail: true });
		}
	}
};
