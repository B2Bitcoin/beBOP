import { collections } from '$lib/server/database.js';
import { userIdentifier, userQuery } from '$lib/server/user.js';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { COUNTRY_ALPHA2S, type CountryAlpha2 } from '$lib/types/Country';

export const load = async (event) => {
	const lastOrders = await collections.orders
		.find({
			...userQuery(userIdentifier(event.locals))
		})
		.sort({ createdAt: -1 })
		.limit(50)
		.toArray();
	const session = await collections.sessions.findOne({
		sessionId: event.locals.sessionId
	});

	return {
		orders: lastOrders.map((order) => ({
			_id: order._id,
			payments: order.payments.map((payment) => ({
				status: payment.status,
				method: payment.method,
				id: payment._id.toString()
			})),
			currencySnapshot: order.currencySnapshot,
			number: order.number,
			createdAt: order.createdAt,
			notes:
				order.notes?.map((note) => ({
					content: note.content,
					createdAt: note.createdAt
				})) || [],
			status: order.status
		})),
		countryCode: event.locals.countryCode,
		sessionPos: session?.pos
	};
};

export const actions: Actions = {
	overwrite: async ({ request, locals }) => {
		const formData = await request.formData();
		const country = z
			.object({
				country: z.enum([...COUNTRY_ALPHA2S] as [CountryAlpha2, ...CountryAlpha2[]])
			})
			.parse({
				country: formData.get('countryCode')
			});
		const countryCode = country.country;
		await collections.sessions.updateOne(
			{
				sessionId: locals.sessionId
			},
			{
				$set: {
					updatedAt: new Date(),
					pos: {
						countryCodeOverwrite: countryCode
					}
				}
			}
		);
		throw redirect(303, `/pos`);
	},
	removeOverwrite: async ({ locals }) => {
		await collections.sessions.updateOne(
			{
				sessionId: locals.sessionId
			},
			{
				$set: {
					updatedAt: new Date()
				},
				$unset: {
					pos: ''
				}
			}
		);
		throw redirect(303, `/pos`);
	}
};
