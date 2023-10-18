import { z } from 'zod';
import { sendAuthentificationlink } from '$lib/server/sendNotification';
import { bech32 } from 'bech32';
import { jwtVerify } from 'jose';
import { runtimeConfig } from '$lib/server/runtime-config.js';
import { fail } from '@sveltejs/kit';
import { collections } from '$lib/server/database.js';

export const load = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (token) {
		try {
			const authLink = await jwtVerify(token, Buffer.from(runtimeConfig.authLinkJwtSigningKey));

			const { npub, email } = z
				.object({
					npub: z.string().optional(),
					email: z.string().optional()
				})
				.parse(authLink);

			if (npub) {
				return {
					npubToLogin: npub
				};
			} else if (email) {
				return {
					emailToLogin: email
				};
			}
		} catch (err) {
			return { error: 'Invalid or expired token' };
		}
	}
};

export const actions = {
	sendLink: async function ({ request }) {
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

		await sendAuthentificationlink(address.includes('@') ? { email: address } : { npub: address });
		return { address, successUser: true };
	},
	validate: async function ({ url, locals }) {
		const token = url.searchParams.get('token');

		if (!token) {
			return fail(400, { error: 'Invalid or expired token' });
		}
		try {
			const authLink = await jwtVerify(token, Buffer.from(runtimeConfig.authLinkJwtSigningKey));

			const { npub, email } = z
				.object({
					npub: z.string().optional(),
					email: z.string().optional()
				})
				.parse(authLink);

			await collections.sessions.updateOne(
				{
					sessionId: locals.sessionId
				},
				{
					$setOnInsert: {
						createdAt: new Date()
					},
					$set: {
						updatedAt: new Date(),
						...(npub && { npub }),
						...(email && { email })
					}
				},
				{
					upsert: true
				}
			);
		} catch (err) {
			return fail(400, { error: 'Invalid or expired token' });
		}
	}
};
