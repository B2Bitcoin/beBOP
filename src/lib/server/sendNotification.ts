import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database';
import type { User } from '$lib/types/User';
import { ObjectId } from 'mongodb';
import { Kind } from 'nostr-tools';
import { runtimeConfig } from './runtime-config';
import { SignJWT } from 'jose';

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

export async function sendAuthentificationlink(session: { email?: string; npub?: string }) {
	const content = (token: string) => `${
		runtimeConfig.brandName
	} + ${ORIGIN} - Temporary session request\n\n
	Dear user,\n\n
	This message was sent to you because you have requested a temporary session link.\n\n
	You'll be able to do it by following this link : ${ORIGIN}/customer/login?token=${encodeURIComponent(
		token
	)}\n\n
	If you didn't ask for this temporary session procedure, please ignore this message and do nothing.\n\n
    Best regards,\n\n
    ${runtimeConfig.brandName} team`;
	if (session.npub) {
		const jwt = await new SignJWT({ npub: session.npub })
			.setExpirationTime('1h')
			.setProtectedHeader({ alg: 'HS256' })
			.sign(Buffer.from(runtimeConfig.authLinkJwtSigningKey));
		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			kind: Kind.EncryptedDirectMessage,
			updatedAt: new Date(),
			content: content(jwt),
			dest: session.npub
		});
	}
	if (session.email) {
		const jwt = await new SignJWT({ email: session.email })
			.setExpirationTime('1h')
			.setProtectedHeader({ alg: 'HS256' })
			.sign(Buffer.from(runtimeConfig.authLinkJwtSigningKey));
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Password Reset`,
			htmlContent: content(jwt),
			dest: session.email
		});
	}
}
