import { createTestAccount, createTransport, type Transporter } from 'nodemailer';
import {
	SMTP_FAKE,
	SMTP_HOST,
	SMTP_PASSWORD,
	SMTP_PORT,
	SMTP_USER,
	SMTP_FROM
} from '$env/static/private';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { htmlToText } from 'html-to-text';
import { runtimeConfig } from './runtime-config';

const fakeEmail = SMTP_FAKE === 'true' || SMTP_FAKE === '1';
export const emailsEnabled = !!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD) || fakeEmail;

let _transporter: Transporter<SMTPTransport.SentMessageInfo> | null;

async function getTransporter() {
	if (_transporter) {
		return _transporter;
	}

	if (fakeEmail) {
		const testAccount = await createTestAccount();

		_transporter = createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass
			}
		});
	} else {
		_transporter = createTransport({
			host: SMTP_HOST,
			port: parseInt(SMTP_PORT),
			secure: SMTP_PORT === '465',
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASSWORD
			}
		});
	}

	return _transporter;
}

/**
 * Do not call this function directly, instead insert the email in `collections.emailNotifications` and let the worker handle it.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }) {
	const transporter = await getTransporter();

	const res = await transporter.sendMail({
		from: SMTP_FROM || SMTP_USER,
		to: params.to,
		subject: params.subject,
		html: params.html,
		text: htmlToText(params.html),
		...(!!runtimeConfig.sellerIdentity?.contact.email && {
			replyTo: runtimeConfig.sellerIdentity?.contact.email
		})
	});

	console.log('Email sent', res);
}
