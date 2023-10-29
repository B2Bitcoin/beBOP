import { collections } from '$lib/server/database.js';
import { CUSTOMER_ROLE_ID } from '$lib/types/User.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const actions = {
	default: async function (event) {
		const data = await event.request.formData();

		const parsed = z
			.object({
				id: z.string().trim(),
				name: z.string().trim(),
				read: z.array(z.string()).default([]),
				write: z.array(z.string()).default([]),
				forbidden: z.array(z.string()).default([])
			})
			.parse({
				id: data.get('id'),
				name: data.get('name'),
				read: JSON.parse(data.get('read')?.toString() ?? '[]'),
				write: JSON.parse(data.get('write')?.toString() ?? '[]'),
				forbidden: JSON.parse(data.get('forbidden')?.toString() ?? '[]')
			});

		if (parsed.id === CUSTOMER_ROLE_ID) {
			throw error(403, 'You cannot edit the customer role');
		}

		await collections.roles.insertOne({
			_id: parsed.id,
			name: parsed.name,
			permissions: {
				read: parsed.read,
				write: parsed.write,
				forbidden: parsed.forbidden
			},
			createdAt: new Date(),
			updatedAt: new Date()
		});

		throw redirect(303, `/admin/arm`);
	}
};
