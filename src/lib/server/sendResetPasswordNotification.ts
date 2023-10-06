import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database';
import type { User } from '$lib/types/User';
import { ObjectId } from 'mongodb';
import { Kind } from 'nostr-tools';

export async function sendResetPasswordNotification(user: User) {
	const passwordReset = await collections.passwordResets.findOne({ userId: user._id });
	let content = `{Shop name + shop url] - Password reset\n\nDear user,\n\n
        This message was sent to you because you have requested to reset your password.\n\n
        You'll be able to do it by following this link : ${ORIGIN}/admin/reset/${passwordReset?.tokenUrl}\n\n
        If you didn't ask for this password reset procedure, please ignore this message and do nothing.\n\n
        Best regards,\n\n
        {Shop name} team`;
	if (user.backupInfo.nostr) {
		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			kind: Kind.EncryptedDirectMessage,
			updatedAt: new Date(),
			content,
			dest: user.backupInfo.nostr
		});
	}
	if (user.backupInfo.email) {
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Password Reset`,
			htmlContent: content,
			dest: user.backupInfo.email
		});
	}
}
