import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database';
import type { User } from '$lib/types/User';
import { ObjectId } from 'mongodb';
import { Kind } from 'nostr-tools';
import { runtimeConfig } from './runtime-config';
import type { Session } from '$lib/types/session';

export async function sendResetPasswordNotification(user: User) {
	const content = `${runtimeConfig.brandName} + ${ORIGIN} - Password reset\n\n
		Dear user,\n\n
        This message was sent to you because you have requested to reset your password.\n\n
        You'll be able to do it by following this link : ${ORIGIN}/admin/login/reset/${user.passwordReset?.token}\n\n
        If you didn't ask for this password reset procedure, please ignore this message and do nothing.\n\n
        Best regards,\n\n
        ${runtimeConfig.brandName} team`;
	if (user.backupInfo?.npub) {
		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			kind: Kind.EncryptedDirectMessage,
			updatedAt: new Date(),
			content,
			dest: user.backupInfo.npub
		});
	}
	if (user.backupInfo?.email) {
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

export async function sendAuthentificationlink(session: Session) {
	const content = `${runtimeConfig.brandName} + ${ORIGIN} - Temporary session request\n\n
	Dear user,\n\n
	This message was sent to you because you have requested a temporary session link.\n\n
	You'll be able to do it by following this link : ${ORIGIN}/customer/login/${session.authLink?.token}\n\n
	If you didn't ask for this temporary session procedure, please ignore this message and do nothing.\n\n
    Best regards,\n\n
    ${runtimeConfig.brandName} team`;
	if (session.npub) {
		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			kind: Kind.EncryptedDirectMessage,
			updatedAt: new Date(),
			content,
			dest: session.npub
		});
	}
	if (session.email) {
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Password Reset`,
			htmlContent: content,
			dest: session.email
		});
	}
}

export async function sendFailAuthentificationlink(address: string) {
	const content = `${runtimeConfig.brandName} + ${ORIGIN} - Temporary session request\n\n
	Dear visitor,\n\n
	This message was sent to you because you have requested a temporary session link.\n\n
	Sadly, no information was found about your contact.\n\n
	Are you sure you use this {nostr npub / email address / contact mean} previously on our website ?\n\n
	If you didn't ask for this temporary session procedure, please ignore this message and do nothing.
    Best regards,\n\n
    ${runtimeConfig.brandName} team`;
	if (!address.includes('@')) {
		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			kind: Kind.EncryptedDirectMessage,
			updatedAt: new Date(),
			content,
			dest: address
		});
	} else {
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Password Reset`,
			htmlContent: content,
			dest: address
		});
	}
}
