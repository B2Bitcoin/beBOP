import { ZodError } from 'zod';
import type { HandleServerError, Handle } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import { ObjectId } from 'mongodb';
import { addYears } from 'date-fns';

import '$lib/server/locks';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '$env/static/private';

export const handleError = (({ error, event }) => {
	console.error('handleError', error);
	if (typeof error === 'object' && error) {
		collections.errors
			.insertOne({
				_id: new ObjectId(),
				url: event.url.href,
				method: event.request.method,
				...error
			})
			.catch();
	}

	if (error instanceof ZodError) {
		event.locals.status = 422;
		const formattedError = error.format();

		if (formattedError._errors.length) {
			return { message: formattedError._errors[0], status: 422 };
		}

		return {
			message: Object.entries(formattedError)
				.map(([key, val]) => {
					if (typeof val === 'object' && val && '_errors' in val && Array.isArray(val._errors)) {
						return `${key}: ${val._errors[0]}`;
					}
				})
				.filter(Boolean)
				.join(', '),
			status: 422
		};
	}
}) satisfies HandleServerError;

export const handle = (async ({ event, resolve }) => {
	if (
		(event.url.pathname.startsWith('/admin/') || event.url.pathname === '/admin') &&
		ADMIN_LOGIN &&
		ADMIN_PASSWORD
	) {
		const authorization = event.request.headers.get('authorization');

		if (!authorization?.startsWith('Basic ')) {
			return new Response(null, {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm="Admin"'
				}
			});
		}

		const [login, password] = Buffer.from(authorization.split(' ')[1], 'base64')
			.toString()
			.split(':');

		if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
			return new Response(null, {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic realm="Admin"'
				}
			});
		}
	}

	const token = event.cookies.get('bootik-session');

	event.locals.sessionId = token || crypto.randomUUID();

	// Refresh cookie expiration date
	event.cookies.set('bootik-session', event.locals.sessionId, {
		path: '/',
		sameSite: 'none',
		secure: true,
		httpOnly: true,
		expires: addYears(new Date(), 1)
	});

	const response = await resolve(event);

	// Work around handleError which does not allow setting the header
	const status = event.locals.status;
	if (status) {
		const contentType = response.headers.get('Content-Type');
		return new Response(response.body, {
			...response,
			headers: {
				...Object.fromEntries(response.headers.entries()),
				'content-type': contentType?.includes('html') ? contentType : 'application/json'
			},
			status
		});
	}
	return response;
}) satisfies Handle;
