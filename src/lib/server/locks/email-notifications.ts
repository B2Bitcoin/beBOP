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

	if (change.fullDocument.processedAt) {
		return;
	}
	await sendEmail({
		to: change.fullDocument.dest,
		subject: change.fullDocument.subject,
		html: change.fullDocument.htmlContent
	});

	await collections.emailNotifications.updateOne(
		{ _id: change.fullDocument._id },
		{
			$set: {
				processedAt: new Date(),
				updatedAt: new Date()
			}
		}
	);
}

if (emailsEnabled) {
	// todo: resume changestream on restart if possible
	collections.emailNotifications
		.watch([{ $match: { operationType: 'insert' } }], {
			fullDocument: 'updateLookup'
		})
		.on('change', (ev) => handleChanges(ev).catch(console.error));
}
