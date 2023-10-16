import { collections } from '$lib/server/database';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { addMinutes } from 'date-fns';
import {
	sendAuthentificationlink,
	sendFailAuthentificationlink
} from '$lib/server/sendNotification';
import { ObjectId } from 'mongodb';
import { runtimeConfig } from '$lib/server/runtime-config';
import { bech32 } from 'bech32';
import { CUSTOMER_ROLE_ID } from '$lib/types/User';

export const load = async (params) => {
	const session = await params.locals.getSession();
	if (session) {
	}
};

export const actions = {
	default: async function ({ request }) {
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
		const filterBackupInfo = address.includes('@')
			? { 'backupInfo.email': address }
			: { 'backupInfo.npub': address };
		const existUser = await collections.users.findOne(filterBackupInfo);

		if (existUser) {
			const user = await collections.users.findOneAndUpdate(
				{ _id: existUser._id, roleId: CUSTOMER_ROLE_ID },
				{
					$set: {
						authLink: { token: crypto.randomUUID(), expiresAt: addMinutes(new Date(), 60) },
						updatedAt: new Date()
					}
				},
				{ returnDocument: 'after' }
			);
			if (user.value) {
				await sendAuthentificationlink(user.value);
				return { address, successExistUser: true };
			}
		}
		if (!runtimeConfig.createUserOnSession) {
			await sendFailAuthentificationlink(address);
			return { address, cannotCreateUser: true };
		}

		const user = await collections.users.insertOne({
			_id: new ObjectId(),
			login: address,
			backupInfo: address.includes('@')
				? {
						email: address
				  }
				: {
						npub: address
				  },
			roleId: CUSTOMER_ROLE_ID,
			status: 'active',
			authLink: { token: crypto.randomUUID(), expiresAt: addMinutes(new Date(), 60) },
			updatedAt: new Date(),
			createdAt: new Date()
		});
		const userCreated = await collections.users.findOne({ _id: user.insertedId });
		if (userCreated) {
			await sendAuthentificationlink(userCreated);
			return { address, successUser: true };
		} else {
			return fail(400, { fail: true });
		}
	}
};
