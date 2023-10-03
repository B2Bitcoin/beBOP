import { ZodError } from 'zod';
import { type HandleServerError, type Handle, error } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import { ObjectId } from 'mongodb';
import { addYears } from 'date-fns';
import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';

import '$lib/server/locks';
import {
	ADMIN_LOGIN,
	ADMIN_PASSWORD,
	AUTH_SECRET,
	GITHUB_ID,
	GITHUB_SECRET
} from '$env/static/private';
import { refreshPromise, runtimeConfig } from '$lib/server/runtime-config';
import type { CMSPage } from '$lib/types/CmsPage';
import { sequence } from '@sveltejs/kit/hooks';
// import { countryFromIp } from '$lib/server/geoip';

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

export const handleAdmin = (async ({ event, resolve }) => {
	await refreshPromise;

	// event.locals.countryCode = countryFromIp(event.getClientAddress());

	const isAdminUrl = event.url.pathname.startsWith('/admin/') || event.url.pathname === '/admin';
	const cmsPageMaintenanceAvailable = await collections.cmsPages
		.find({
			maintenanceDisplay: true
		})
		.project<Pick<CMSPage, '_id'>>({
			_id: 1
		})
		.toArray();
	if (isAdminUrl && ADMIN_LOGIN && ADMIN_PASSWORD) {
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
	const slug = event.url.pathname.split('/')[1] ? event.url.pathname.split('/')[1] : 'home';

	if (
		runtimeConfig.isMaintenance &&
		!isAdminUrl &&
		event.url.pathname !== '/logo' &&
		!event.url.pathname.startsWith('/.well-known/') &&
		!event.url.pathname.startsWith('/picture/raw/') &&
		!cmsPageMaintenanceAvailable.find((cmsPage) => cmsPage._id === slug) &&
		!runtimeConfig.maintenanceIps.split(',').includes(event.getClientAddress())
	) {
		if (event.request.method !== 'GET') {
			throw error(405, 'Site is in maintenance mode. Please try again later.');
		}
		throw error(503, 'Site is in maintenance mode. Please try again later.');
	}

	const token = event.cookies.get('bootik-session');

	event.locals.sessionId = token || crypto.randomUUID();

	// Refresh cookie expiration date
	event.cookies.set('bootik-session', event.locals.sessionId, {
		path: '/',
		sameSite: 'lax',
		secure: true,
		httpOnly: true,
		expires: addYears(new Date(), 1)
	});

	const response = await resolve(event);

	if (
		response.status >= 500 &&
		(!event.locals.status || event.locals.status >= 500) &&
		response.headers.get('Content-Type')?.includes('text/html')
	) {
		const errorPages = await collections.cmsPages.countDocuments({
			_id: 'error'
		});

		if (errorPages) {
			return new Response(null, {
				status: 302,
				headers: {
					location: '/error'
				}
			});
		}
	}

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

export const handleAuthSvelte = SvelteKitAuth(async (event) => {
	const authOptions = {
		providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })],
		secret: AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
}) satisfies Handle;

export const handle = sequence(handleAdmin, handleAuthSvelte);
