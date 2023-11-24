import { ZodError } from 'zod';
import { type HandleServerError, type Handle, error, redirect } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import { ObjectId } from 'mongodb';
import { addYears } from 'date-fns';
import { SvelteKitAuth } from '@auth/sveltekit';
import { adminPrefix } from '$lib/server/admin';
import '$lib/server/locks';
import { refreshPromise, runtimeConfig } from '$lib/server/runtime-config';
import type { CMSPage } from '$lib/types/CmsPage';
import { CUSTOMER_ROLE_ID, POS_ROLE_ID } from '$lib/types/User';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Facebook from '@auth/core/providers/facebook';
import Twitter from '@auth/core/providers/twitter';
import {
	FACEBOOK_ID,
	FACEBOOK_SECRET,
	GITHUB_ID,
	GITHUB_SECRET,
	GOOGLE_ID,
	GOOGLE_SECRET,
	ORIGIN,
	TWITTER_ID,
	TWITTER_SECRET
} from '$env/static/private';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { sha256 } from '$lib/utils/sha256';
import { countryFromIp } from '$lib/server/geoip';
import { isAllowedOnPage } from '$lib/types/Role';
import { languages } from '$lib/translations';
import { addTranslations } from '$lib/i18n';
import { filterNullish } from '$lib/utils/fillterNullish';

const SSO_COOKIE = 'next-auth.session-token';

for (const entry of Object.entries(languages)) {
	addTranslations(entry[0], entry[1]);
}

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

const handleGlobal: Handle = async ({ event, resolve }) => {
	event.locals.countryCode = countryFromIp(event.getClientAddress());

	const admin = adminPrefix();

	const isAdminUrl =
		/^\/admin(-[a-zA-Z0-9]+)?(\/|$)/.test(event.url.pathname) &&
		!(
			/^\/admin(-[a-zA-Z0-9]+)?\/(login|logout)(\/|$)/.test(event.url.pathname) // Allow login/logout
		);

	const cmsPageMaintenanceAvailable = await collections.cmsPages
		.find({
			maintenanceDisplay: true
		})
		.project<Pick<CMSPage, '_id'>>({
			_id: 1
		})
		.toArray();

	const slug = event.url.pathname.split('/')[1] ? event.url.pathname.split('/')[1] : 'home';

	event.locals.clientIp = event.getClientAddress();

	// Prioritize lang in URL, then in accept-language header, then default to en
	const acceptLanguages = filterNullish([
		event.url.searchParams.get('lang'),
		...(event.request.headers
			.get('accept-language')
			?.split(',')
			?.map((lang) => lang.slice(0, 2)) ?? []),
		'en'
	]);
	event.locals.language = acceptLanguages.find((l) => l in languages) || 'en';

	if (
		runtimeConfig.isMaintenance &&
		!isAdminUrl &&
		event.url.pathname !== '/logo' &&
		!event.url.pathname.startsWith('/.well-known/') &&
		!event.url.pathname.startsWith('/picture/raw/') &&
		event.url.pathname !== '/lightning/pay' &&
		!cmsPageMaintenanceAvailable.find((cmsPage) => cmsPage._id === slug) &&
		!runtimeConfig.maintenanceIps.split(',').includes(event.locals.clientIp)
	) {
		if (event.request.method !== 'GET') {
			throw error(405, 'Site is in maintenance mode. Please try again later.');
		}
		throw error(503, 'Site is in maintenance mode. Please try again later.');
	}

	const token = event.cookies.get('bootik-session');

	const secretSessionId = token || crypto.randomUUID();
	event.locals.sessionId = await sha256(secretSessionId);
	// Refresh cookie expiration date
	event.cookies.set('bootik-session', secretSessionId, {
		path: '/',
		sameSite: 'lax',
		secure: true,
		httpOnly: true,
		expires: addYears(new Date(), 1)
	});

	const session = (
		await collections.sessions.findOneAndUpdate(
			{
				sessionId: event.locals.sessionId
			},
			{
				$set: {
					updatedAt: new Date(),
					expiresAt: addYears(new Date(), 1)
				}
			}
		)
	).value;
	if (session) {
		if (session.userId) {
			const user = await collections.users.findOne({
				_id: session.userId,
				disabled: { $ne: true }
			});
			if ((session.expireUserAt && session.expireUserAt < new Date()) || !user) {
				await collections.sessions.updateOne(
					{
						sessionId: event.locals.sessionId
					},
					{
						$unset: {
							userId: '',
							expireUserAt: ''
						}
					}
				);
			} else {
				if (user) {
					event.locals.user = {
						_id: user._id,
						login: user.login ? user.login : '',
						roleId: user.roleId
					};
				}
			}
		}
		event.locals.email = session.email;
		event.locals.npub = session.npub;
		event.locals.sso = session.sso;
	}
	if (
		/^\/admin(-[a-zA-Z0-9]+)?(\/|$)/.test(event.url.pathname) &&
		!event.url.pathname.startsWith(admin)
	) {
		if (!event.locals.user || event.locals.user.roleId === CUSTOMER_ROLE_ID) {
			throw error(403, 'Wrong admin prefix. Make sure to type the correct admin URL.');
		}
		return new Response(null, {
			status: 307,
			headers: {
				location: event.url.href.replace(/\/admin(-[a-zA-Z0-9]+)?/, admin)
			}
		});
	}
	// Protect any routes under /admin
	if (isAdminUrl) {
		if (!event.locals.user) {
			throw redirect(303, `${admin}/login`);
		}

		if (event.locals.user.roleId === CUSTOMER_ROLE_ID) {
			throw error(403, 'You are not allowed to access this page.');
		}

		const role = await collections.roles.findOne({
			_id: event.locals.user.roleId
		});

		if (!role) {
			throw error(403, 'Your role does not exist in DB.');
		}

		const method = event.request.method.toLowerCase();

		if (
			!isAllowedOnPage(
				role,
				event.url.pathname,
				['get', 'head', 'options'].includes(method) ? 'read' : 'write'
			)
		) {
			if (method === 'get' || method === 'head') {
				throw redirect(307, '/admin');
			}

			throw error(403, 'You are not allowed to access this page.');
		}
	}

	if (event.url.pathname.startsWith('/pos/') || event.url.pathname === '/pos') {
		if (!event.locals.user) {
			throw redirect(303, '/admin/login');
		}

		if (event.locals.user.roleId !== POS_ROLE_ID) {
			throw error(403, 'You are not allowed to access this page, only point-of-sale accounts are.');
		}
	}

	let transformed = false;
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			if (!transformed) {
				transformed = true;
				return html.replace('<html', `<html lang="${event.locals.language}"`);
			}
			return html;
		}
	});

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
};

const handleSsoCookie: Handle = async ({ event, resolve }) => {
	const ssoSession = await event.locals.getSession();
	if (ssoSession?.user?.name && 'id' in ssoSession.user && typeof ssoSession.user.id === 'string') {
		event.cookies.delete(SSO_COOKIE, { path: '/' });

		const session = await collections.sessions.findOne({
			sessionId: event.locals.sessionId
		});

		const provider = ssoSession.user.id.split('-')[0];
		const ssoInfo = {
			provider,
			id: ssoSession.user.id,
			email: ssoSession.user.email ?? undefined,
			avatarUrl: ssoSession.user.image ?? undefined,
			name: ssoSession.user.name
		};

		if (!session) {
			await collections.sessions.insertOne({
				sessionId: event.locals.sessionId,
				createdAt: new Date(),
				updatedAt: new Date(),
				_id: new ObjectId(),
				expiresAt: addYears(new Date(), 1),
				sso: [ssoInfo]
			});
		} else {
			await collections.sessions.updateOne(
				{
					sessionId: event.locals.sessionId
				},
				{
					$set: {
						updatedAt: new Date(),
						expiresAt: addYears(new Date(), 1),
						sso: [...(session.sso || []).filter((s) => s.provider !== ssoInfo.provider), ssoInfo]
					}
				}
			);
		}
		event.locals.sso = [
			...(session?.sso || []).filter((s) => s.provider !== ssoInfo.provider),
			ssoInfo
		];
	}

	const response = await resolve(event);

	return response;
};

const authProviders = [
	...(GITHUB_ID && GITHUB_SECRET
		? [
				GitHub({
					clientId: GITHUB_ID,
					clientSecret: GITHUB_SECRET,
					profile: (param) => {
						return {
							id: 'github-' + param.id.toString(),
							name: param.name,
							image: param.avatar_url,
							email: param.email
						};
					}
				})
		  ]
		: []),
	...(GOOGLE_ID && GOOGLE_SECRET
		? [
				Google({
					clientId: GOOGLE_ID,
					clientSecret: GOOGLE_SECRET,
					profile: (param) => ({
						name: param.name,
						email: param.email,
						image: param.picture,
						id: 'google-' + param.sub
					})
				})
		  ]
		: []),
	...(FACEBOOK_ID && FACEBOOK_SECRET
		? [
				Facebook({
					clientId: FACEBOOK_ID,
					clientSecret: FACEBOOK_SECRET,
					profile: (param) => ({
						id: 'facebook-' + param.id,
						name: param.name,
						email: param.email,
						image: param.picture.data.url
					})
				})
		  ]
		: []),
	...(TWITTER_ID && TWITTER_SECRET
		? [
				Twitter({
					clientId: TWITTER_ID,
					clientSecret: TWITTER_SECRET,
					profile: (param) => ({
						id: 'twitter-' + param.data.id,
						name: param.data.name,
						email: param.data.email,
						image: param.data.profile_image_url
					})
				})
		  ]
		: [])
];

if (!building) {
	await refreshPromise;
}

const handleSSO = authProviders
	? SvelteKitAuth({
			// Should be fine as long as your reverse proxy is configured to only accept traffic with the correct host header
			trustHost: true,
			providers: authProviders,
			secret: runtimeConfig.ssoSecret,
			/**
			 * Ideally we'd not store in the cookie at all, updating the session in DB directly.
			 *
			 * But I'm not sure it's possible to do that with @auth/sveltekit. So instead, we allow the
			 * cookie to be set, and read its data with `getSession()` and update the session in DB and unset the cookie immediately after.
			 */
			cookies: {
				sessionToken: {
					name: 'next-auth.session-token',
					options: {
						httpOnly: true,
						secure: ORIGIN.startsWith('https://'),
						sameSite: 'lax',
						path: '/'
					}
				}
			},
			callbacks: {
				/**
				 * Get the user's ID from the token and add it to the session
				 */
				session: async (params) => {
					if (params.session.user) {
						Object.assign(params.session.user, {
							id: params.token.sub
						});
					}
					return params.session;
				}
			}
	  })
	: null;

export const handle = handleSSO ? sequence(handleGlobal, handleSSO, handleSsoCookie) : handleGlobal;
