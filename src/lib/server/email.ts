import { createTestAccount, createTransport, type Transporter } from 'nodemailer';
import {
	SMTP_FAKE,
	SMTP_HOST,
	SMTP_PASSWORD,
	SMTP_PORT,
	SMTP_USER,
	SMTP_FROM,
	ORIGIN
} from '$env/static/private';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { htmlToText } from 'html-to-text';
import { defaultConfig, runtimeConfig, type EmailTemplateKey } from './runtime-config';
import { collections } from './database';
import { ClientSession, ObjectId } from 'mongodb';
import { mapKeys } from '$lib/utils/mapKeys';

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
 * Do not call this function directly, instead call queueEmail.
 */
export async function sendEmail(params: {
	to: string;
	subject: string;
	html: string;
	cc?: string;
}) {
	const transporter = await getTransporter();

	const res = await transporter.sendMail({
		from: SMTP_FROM || SMTP_USER,
		to: params.to,
		subject: params.subject,
		html: params.html,
		text: htmlToText(params.html),
		...(!!runtimeConfig.sellerIdentity?.contact.email && {
			replyTo: runtimeConfig.sellerIdentity?.contact.email
		}),
		...(params.cc && {
			cc: params.cc
		})
	});

	console.log('Email sent', res);
}

export async function queueEmail(
	to: string,
	templateKey: EmailTemplateKey,
	vars: Record<string, string | undefined>,
	opts?: {
		session?: ClientSession;
		cc?: string;
	}
): Promise<void> {
	const lowerVars = mapKeys(
		{
			...vars,
			websiteLink: ORIGIN,
			brandName: runtimeConfig.brandName,
			iban: runtimeConfig.sellerIdentity?.bank?.iban,
			bic: runtimeConfig.sellerIdentity?.bank?.bic
		},
		(key) => key.toLowerCase()
	);
	const template = runtimeConfig.emailTemplates[templateKey].default
		? defaultConfig.emailTemplates[templateKey]
		: runtimeConfig.emailTemplates[templateKey];

	await collections.emailNotifications.insertOne(
		{
			_id: new ObjectId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			dest: to,
			...(opts &&
				opts.cc && {
					cc: opts.cc
				}),
			subject: template.subject.replace(/{{([^}]+)}}/g, (match, p1) => {
				return lowerVars[p1.toLowerCase()] || match;
			}),
			htmlContent: template.html.replace(/{{([^}]+)}}/g, (match, p1) => {
				return lowerVars[p1.toLowerCase()] || match;
			})
		},
		{
			session: opts?.session
		}
	);
}
