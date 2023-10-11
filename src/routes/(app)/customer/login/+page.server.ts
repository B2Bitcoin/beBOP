import { collections } from '$lib/server/database';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { addMinutes } from 'date-fns';
import { sendAuthentificationlink } from '$lib/server/sendNotification';
import { ObjectId } from 'mongodb';
import { runtimeConfig } from '$lib/server/runtime-config';

export const load = async () => {};

export const actions = {
	default: async function ({ request }) {
		const data = await request.formData();
		const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

		const { address } = z
			.object({
				address: z.string()
			})
			.parse({
				address: data.get('address')
			});
		const filterBackupInfo = emailPattern.test(address)
			? { 'backupInfo.email': address }
			: { 'backupInfo.nostr': address };
		const existUser = await collections.users.findOne(filterBackupInfo);

		if (runtimeConfig.createUserOnSession) {
			if (existUser) {
				const user = await collections.users.updateOne(filterBackupInfo, {
					$set: {
						authLink: { token: crypto.randomUUID(), expiresAt: addMinutes(new Date(), 60) },
						updatedAt: new Date()
					}
				});
				if (user) {
					const userUpdated = await collections.users.findOne(filterBackupInfo);
					if (userUpdated) sendAuthentificationlink(userUpdated);
					return { address, successUser: true };
				}
			} else {
				const user = await collections.users.insertOne({
					_id: new ObjectId(),
					backupInfo: emailPattern.test(address)
						? {
								email: address
						  }
						: {
								nostr: address
						  },
					roleId: 'customer',
					status: 'active',
					authLink: { token: crypto.randomUUID(), expiresAt: addMinutes(new Date(), 60) },
					updatedAt: new Date(),
					createdAt: new Date()
				});
				if (user) {
					const userCreated = await collections.users.findOne({ _id: user.insertedId });
					if (userCreated) sendAuthentificationlink(userCreated);
					return { address, successUser: true };
				} else {
					return fail(400, { fail: true });
				}
			}
		} else {
			if (existUser) {
				const user = await collections.users.updateOne(filterBackupInfo, {
					$set: {
						authLink: { token: crypto.randomUUID(), expiresAt: addMinutes(new Date(), 60) },
						updatedAt: new Date()
					}
				});
				if (user) {
					const userUpdated = await collections.users.findOne(filterBackupInfo);
					if (userUpdated) sendAuthentificationlink(userUpdated);
					return { address, successExistUser: true };
				} else {
					return fail(400, { fail: true });
				}
			}
			return { address, successExistUser: true };
		}
	}
};
