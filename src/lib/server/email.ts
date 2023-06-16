import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '$env/static/private';

export const emailsEnabled = !!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD);
