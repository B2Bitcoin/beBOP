import type { ChangeStreamDocument } from 'mongodb';
import { Lock } from '../lock';
import { collections } from '../database';
import type { EmailNotification } from '$lib/types/EmailNotification';
import { emailsEnabled, sendEmail } from '../email';

const lock = emailsEnabled ? new Lock('notifications.email') : null;

async function handleChanges(change: ChangeStreamDocument<EmailNotification>): Promise<void> {
	if (!lock?.ownsLock || !('fullDocument' in change) || !change.fullDocument) {
		return;
	}

	await handleEmailNotification(change.fullDocument);
}

const processingIds = new Set<string>();

async function handleEmailNotification(email: EmailNotification): Promise<void> {
	if (email.processedAt || processingIds.has(email._id.toString())) {
		return;
	}

	try {
		processingIds.add(email._id.toString());

		const updatedEmail = await collections.emailNotifications.findOne({
			_id: email._id
		});
		if (!updatedEmail || updatedEmail.processedAt) {
			return;
		}
		email = updatedEmail;

		try {
			await sendEmail({
				to: email.dest,
				subject: email.subject,
				html: email.htmlContent
			});
		} catch (err) {
			collections.emailNotifications
				.updateOne({ _id: email._id }, { $set: { error: err as Error } })
				.catch(console.error);
		}

		await collections.emailNotifications.updateOne(
			{ _id: email._id },
			{
				$set: {
					processedAt: new Date(),
					updatedAt: new Date()
				}
			}
		);
	} finally {
		processingIds.delete(email._id.toString());
	}
}

if (emailsEnabled) {
	collections.emailNotifications
		.watch([{ $match: { operationType: 'insert' } }], {
			fullDocument: 'updateLookup'
		})
		.on('change', (ev) => handleChanges(ev).catch(console.error));

	if (lock) {
		lock.onAcquire = async () => {
			const docs = collections.emailNotifications.find({
				processedAt: { $exists: false }
			});

			for await (const doc of docs) {
				await handleEmailNotification(doc);
			}
		};
	}
}
