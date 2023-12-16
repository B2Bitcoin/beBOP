import { ORIGIN } from '$env/static/private';
import { collections } from '$lib/server/database';
import type { User } from '$lib/types/User';
import { ObjectId } from 'mongodb';
import { Kind } from 'nostr-tools';
import { runtimeConfig } from './runtime-config';
import { SignJWT } from 'jose';
import { addMinutes } from 'date-fns';
import { adminPrefix } from '$lib/server/admin';
import { error } from '@sveltejs/kit';

export async function sendResetPasswordNotification(
	user: User,
	opts?: { alternateEmail?: string }
) {
	let email = user.recovery?.email;
	const npub = user.recovery?.npub;

	if (!email && !npub) {
		if (opts?.alternateEmail) {
			email = opts.alternateEmail;
		} else {
			throw error(400, 'User has no recovery email or npub');
		}
	}
	const updatedUser = (
		await collections.users.findOneAndUpdate(
			{ _id: user._id },
			{
				$set: {
					passwordReset: {
						token: crypto.randomUUID(),
						expiresAt: addMinutes(new Date(), 15)
					}
				}
			},
			{
				returnDocument: 'after'
			}
		)
	).value;
	if (!updatedUser) {
		throw new Error('Problem updating user');
	}
	if (npub) {
		const content = `Dear user,
		
This message was sent to you because you have requested to reset your password.

Follow this link to reset your password: ${ORIGIN}${adminPrefix()}/login/reset/${updatedUser
			.passwordReset?.token}
		
If you didn't ask for this password reset procedure, please ignore this message and do nothing.

Best regards,
${runtimeConfig.brandName} team`;
		await collections.nostrNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			kind: Kind.EncryptedDirectMessage,
			updatedAt: new Date(),
			content,
			dest: npub
		});
	}
	if (email) {
		const content = `<p>Dear user,</p>
		<p>This message was sent to you because you have requested to reset your password.</p>
		<p>Follow <a href="${ORIGIN}${adminPrefix()}/login/reset/${updatedUser.passwordReset
			?.token}">this link</a> to reset your password.</p>
		<p>If you didn't ask for this password reset procedure, please ignore this message and do nothing.</p>
		<p>Best regards,<br>${runtimeConfig.brandName} team</p>`;
		await collections.emailNotifications.insertOne({
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			subject: `Password Reset`,
			htmlContent: content,
			dest: email
		});
	}

	return {
		email,
		npub
	};
}

export async function sendAuthentificationlink(session: { email?: string; npub?: string }) {
	if (session.npub) {
		const jwt = await new SignJWT({ npub: session.npub })
			.setExpirationTime('1h')
			.setProtectedHeader({ alg: 'HS256' })
			.sign(Buffer.from(runtimeConfig.authLinkJwtSigningKey));

		const content = `Dear user,
		
This message was sent to you because you have requested a temporary session link.

Follow this link to create your temporary session: ${ORIGIN}/login?token=${encodeURIComponent(jwt)}
		
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
<p>We are please to have you in the ${runtimeConfig.brandName} community!<br></p>
<p>To access your private session and benefit from all our exclusive services, please follow <a href="${ORIGIN}/login?token=${encodeURIComponent(
				jwt
			)}">this link</a>.<br></p>
<p>We are delighted to have you with us and look forward to sharing our passion for horology with you.<br></p>
<p>If you have any questions or specific needs, feel free to contact us. We are here to help.<br></p>
<p>Best regards,<br>${runtimeConfig.brandName} team<br></p>
<p>-----<br></p>
<p>Cher utilisatrice, cher utilisateur,<br></p>
<p>Nous sommes ravis de vous compter au sein de la communauté ${runtimeConfig.brandName} !<br></p>
<p>Pour accéder à votre session privée et bénéficier de tous nos services exclusifs, merci de suivre <a href="${ORIGIN}/login?token=${encodeURIComponent(
				jwt
			)}">ce lien</a>.<br></p>
<p>Nous sommes ravis de vous avoir parmi nous et nous sommes impatients de partager avec vous notre passion.<br></p>
<b>Si vous avez des questions ou des besoins particuliers, n'hésitez pas à nous contacter. Nous sommes là pour vous aider.<br></p>
<p>Cordialement,<br>${runtimeConfig.brandName} team</p>`,
			dest: session.email
		});
	}
}
