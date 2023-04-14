import { ZodError } from 'zod';
import type { HandleServerError, Handle } from '@sveltejs/kit';
import { collections } from '$lib/server/database';
import { ObjectId } from 'mongodb';

export const handleError = (({ error, event }) => {
	console.error(error);
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
			return { message: formattedError._errors[0] };
		}

		return {
			message: Object.entries(formattedError)
				.map(([key, val]) => {
					if (typeof val === 'object' && val && '_errors' in val && Array.isArray(val._errors)) {
						return `${key}: ${val._errors[0]}`;
					}
				})
				.filter(Boolean)
				.join(', ')
		};
	}
}) satisfies HandleServerError;

export const handle = (async ({ event, resolve }) => {
	const response = await resolve(event);

	// Work around handleError which does not allow setting the header
	const status = event.locals.status;
	if (status) {
		return new Response(response.body, {
			...response,
			headers: { 'Content-Type': 'application/json', ...response.headers },
			status
		});
	}
	return response;
}) satisfies Handle;
