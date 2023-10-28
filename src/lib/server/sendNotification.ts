import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database';
import type { User } from '$lib/types/User';
import { ObjectId } from 'mongodb';
import { Kind } from 'nostr-tools';
import { runtimeConfig } from './runtime-config';
import { SignJWT } from 'jose';

export async function sendResetPasswordNotification(user: User) {
	if (user.recovery?.npub) {
		const content = `Dear user,
		
This message was sent to you because you have requested to reset your password.

Follow this link to reset your password: ${ORIGIN}/admin/login/reset/${user.passwordReset?.token}
		
If you didn't ask for this password reset procedure, please ignore this message and do nothing.

Best regards,
${runtimeConfig.brandName} team`;
		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			kind: Kind.EncryptedDirectMessage,
			updatedAt: new Date(),
			content,
			dest: user.recovery.npub
		});
	}
	if (user.recovery?.email) {
		const content = `<p>Dear user,</p>
		<p>This message was sent to you because you have requested to reset your password.</p>
		<p>Follow <a href="${ORIGIN}/admin/login/reset/${user.passwordReset?.token}">this link</a> to reset your password.</p>
		<p>If you didn't ask for this password reset procedure, please ignore this message and do nothing.</p>
		<p>Best regards,<br>${runtimeConfig.brandName} team</p>`;
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Password Reset`,
			htmlContent: content,
			dest: user.recovery.email
		});
	}
}

export async function sendAuthentificationlink(session: { email?: string; npub?: string }) {
	if (session.npub) {
		const jwt = await new SignJWT({ npub: session.npub })
			.setExpirationTime('1h')
			.setProtectedHeader({ alg: 'HS256' })
			.sign(Buffer.from(runtimeConfig.authLinkJwtSigningKey));

		const content = `Dear user,
		
This message was sent to you because you have requested a temporary session link.

Follow this link to create your temporary session: ${ORIGIN}/customer/login?token=${encodeURIComponent(
			jwt
		)}
		
If you didn't ask for this temporary session procedure, please ignore this message and do nothing.

Best regards,
${runtimeConfig.brandName} team`;
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
		const jwt = await new SignJWT({ email: session.email })
			.setExpirationTime('1h')
			.setProtectedHeader({ alg: 'HS256' })
			.sign(Buffer.from(runtimeConfig.authLinkJwtSigningKey));
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Temporary session request`,
			htmlContent: `<p>Dear user,</p>
<p>This message was sent to you because you have requested a temporary session link.</p>
<p>Follow <a href="${ORIGIN}/customer/login?token=${encodeURIComponent(
				jwt
			)}">this link</a> to create your temporary session.</p>
<p>If you didn't ask for this temporary session procedure, please ignore this message and do nothing.</p>
<p>Best regards,<br>${runtimeConfig.brandName} team</p>`,
			dest: session.email
		});
	}
}
