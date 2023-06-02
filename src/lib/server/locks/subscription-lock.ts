import { addSeconds, formatDistance } from 'date-fns';
import { collections, withTransaction } from '../database';
import { Lock } from '../lock';
import { processClosed } from '../process';
import { setTimeout } from 'node:timers/promises';
import { runtimeConfig } from '../runtime-config';
import { ObjectId } from 'mongodb';
import { ORIGIN } from '$env/static/private';

const lock = new Lock('paid-subscriptions');

async function maintainLock() {
	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		try {
			const subscriptionsToRemind = collections.paidSubscriptions.find({
				paidUntil: {
					$gt: new Date(),
					$lt: addSeconds(new Date(), runtimeConfig.subscriptionReminderSeconds)
				},
				cancelledAt: { $exists: false },
				'notifications.type': { $ne: 'reminder' }
			});

			for await (const subscription of subscriptionsToRemind) {
				await withTransaction(async (session) => {
					const notifId = new ObjectId();

					await collections.nostrNotifications.insertOne(
						{
							_id: notifId,
							dest: subscription.npub,
							content: `Your subscription #${
								subscription.number
							} is going to expire ${formatDistance(subscription.paidUntil, new Date(), {
								addSuffix: true
							})}. Renew here: ${ORIGIN}/subscription/${subscription._id}`,
							createdAt: new Date(),
							updatedAt: new Date()
						},
						{ session }
					);

					await collections.paidSubscriptions.updateOne(
						{
							_id: subscription._id
						},
						{
							$push: {
								notifications: {
									createdAt: new Date(),
									_id: notifId,
									type: 'reminder'
								}
							}
						},
						{ session }
					);
				}).catch(console.error);
			}
		} catch (err) {
			console.error(err);
		}

		try {
			const subscriptionsToNotifyEnd = collections.paidSubscriptions.find({
				paidUntil: {
					$lt: new Date()
				},
				cancelledAt: { $exists: false },
				'notifications.type': { $ne: 'expiration' }
			});

			for await (const subscription of subscriptionsToNotifyEnd) {
				await withTransaction(async (session) => {
					const notifId = new ObjectId();
					await collections.nostrNotifications.insertOne(
						{
							_id: notifId,
							dest: subscription.npub,
							content: `Your subscription #${subscription.number} expired. Renew here if you wish: ${ORIGIN}/subscription/${subscription._id}`,
							createdAt: new Date(),
							updatedAt: new Date()
						},
						{ session }
					);

					await collections.paidSubscriptions.updateOne(
						{
							_id: subscription._id
						},
						{
							$push: {
								notifications: {
									createdAt: new Date(),
									_id: notifId,
									type: 'expiration'
								}
							}
						},
						{ session }
					);
				}).catch(console.error);
			}
		} catch (err) {
			console.error(err);
		}

		await setTimeout(5_000);
	}
}

maintainLock();
