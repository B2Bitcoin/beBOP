import { ZodError } from 'zod';
import { type HandleServerError, type Handle, error, redirect } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import { ObjectId } from 'mongodb';
import { addMinutes, addYears } from 'date-fns';
import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Facebook from '@auth/core/providers/facebook';
import Twitter from '@auth/core/providers/twitter';

import '$lib/server/locks';
import { refreshPromise, runtimeConfig } from '$lib/server/runtime-config';
import type { CMSPage } from '$lib/types/CmsPage';
import { sequence } from '@sveltejs/kit/hooks';
import {
	FACEBOOK_ID,
	FACEBOOK_SECRET,
	GITHUB_ID,
	GITHUB_SECRET,
	GOOGLE_ID,
	GOOGLE_SECRET,
	TWITTER_ID,
	TWITTER_SECRET
} from '$env/static/private';
import { CUSTOMER_ROLE_ID, SUPER_ADMIN_ROLE_ID } from '$lib/types/User';
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

	const isAdminUrl =
		(event.url.pathname.startsWith('/admin/') || event.url.pathname === '/admin') &&
		!(event.url.pathname.startsWith('/admin/login/') || event.url.pathname === '/admin/login');

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
		event.url.pathname !== '/lightning/pay' &&
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
	const session = await collections.sessions.findOne({
		sessionId: event.locals.sessionId
	});
	if (session) {
		const user = await collections.users.findOne({
			_id: session.userId
		});
		if (user) {
			event.locals.user = {
				login: user.login ? user.login : '',
				role: user.roleId
			};
		}
	}
	// Protect any routes under /admin
	if (isAdminUrl) {
		if (!event.locals.user) {
			throw redirect(303, '/admin/login');
		}
		if (event.locals.user.role !== SUPER_ADMIN_ROLE_ID) {
			throw error(403, 'You are not allowed to access this page.');
		}
	}
	if (runtimeConfig.sessionId !== event.locals.sessionId) {
		runtimeConfig.sessionId = event.locals.sessionId;
		await collections.runtimeConfig.updateOne(
			{ _id: 'sessionId' },
			{ $set: { data: runtimeConfig.sessionId, updatedAt: new Date() } },
			{ upsert: true }
		);
	}

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

export const handleAuthSvelte = SvelteKitAuth({
	providers: [
		GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET }),
		Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET }),
		Facebook({ clientId: FACEBOOK_ID, clientSecret: FACEBOOK_SECRET }),
		Twitter({ clientId: TWITTER_ID, clientSecret: TWITTER_SECRET })
	],
	callbacks: {
		async jwt({ token, user, account }) {
			if (user && user.email) {
				const providerFilter = account?.provider
					? { [`backupInfo.${account?.provider}._id`]: user.id }
					: {};
				const userLocal = await collections.users.findOne(providerFilter);
				if (!userLocal) {
					const newUser = await collections.users.insertOne({
						_id: new ObjectId(),
						login: user.id + user.email,
						backupInfo: {
							[account?.provider ? account?.provider : '']: {
								_id: user.id,
								email: user.email,
								name: user.name
							}
						},
						roleId: CUSTOMER_ROLE_ID,
						updatedAt: new Date(),
						createdAt: new Date()
					});
					await collections.sessions.deleteOne({ sessionId: runtimeConfig.sessionId });
					await collections.sessions.insertOne({
						_id: new ObjectId(),
						userId: newUser.insertedId,
						sessionId: runtimeConfig.sessionId,
						expiresAt: addMinutes(new Date(), 60),
						createdAt: new Date(),
						updatedAt: new Date()
					});
				} else {
					await collections.sessions.deleteOne({ sessionId: runtimeConfig.sessionId });
					await collections.sessions.insertOne({
						_id: new ObjectId(),
						userId: userLocal._id,
						sessionId: runtimeConfig.sessionId,
						expiresAt: addMinutes(new Date(), 60),
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}
			}

			return token;
		}
	}
});

export const handle = sequence(handleAdmin, handleAuthSvelte);
