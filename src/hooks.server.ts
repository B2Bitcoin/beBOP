import { ZodError } from 'zod';
import { type HandleServerError, type Handle, error } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import { ObjectId } from 'mongodb';
import { addYears } from 'date-fns';
import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';

import '$lib/server/locks';
import { AUTH_SECRET, GITHUB_ID, GITHUB_SECRET } from '$env/static/private';
import { refreshPromise, runtimeConfig } from '$lib/server/runtime-config';
import type { CMSPage } from '$lib/types/CmsPage';
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

export const handle = SvelteKitAuth(async (event) => {
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

	const authOptions = {
		providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })],
		secret: AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
}) satisfies Handle;
