import { createTestAccount, createTransport, type Transporter } from 'nodemailer';
import {
	EMAIL_REPLY_TO,
	SMTP_FAKE,
	SMTP_HOST,
	SMTP_PASSWORD,
	SMTP_PORT,
	SMTP_USER
} from '$env/static/private';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { htmlToText } from 'html-to-text';

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

export async function sendEmail(params: { to: string; subject: string; html: string }) {
	const transporter = await getTransporter();

	return transporter.sendMail({
		from: SMTP_USER,
		to: params.to,
		subject: params.subject,
		html: params.html,
		text: htmlToText(params.html),
		...(!!EMAIL_REPLY_TO && { replyTo: EMAIL_REPLY_TO })
	});
}
