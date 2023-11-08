import { adminPrefix } from '$lib/server/admin';
import { collections } from '$lib/server/database.js';
import { POS_ROLE_ID, SUPER_ADMIN_ROLE_ID } from '$lib/types/User.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const actions = {
	update: async function ({ params, request }) {
		const roleId = params.id;

		if (roleId === SUPER_ADMIN_ROLE_ID) {
			throw error(403, 'You cannot edit the super admin role');
		}

		const role = await collections.roles.findOne({
			_id: roleId
		});

		if (!role) {
			throw error(404, 'Role not found');
		}

		const data = await request.formData();

		const parsed = z
			.object({
				name: z.string().trim(),
				read: z.array(z.string()).default([]),
				write: z.array(z.string()).default([]),
				forbidden: z.array(z.string()).default([])
			})
			.parse({
				name: data.get('name'),
				read: JSON.parse(data.get('read')?.toString() ?? '[]'),
				write: JSON.parse(data.get('write')?.toString() ?? '[]'),
				forbidden: JSON.parse(data.get('forbidden')?.toString() ?? '[]')
			});

		await collections.roles.updateOne(
			{
				_id: roleId
			},
			{
				$set: {
					name: parsed.name,
					permissions: {
						read: parsed.read,
						write: parsed.write,
						forbidden: parsed.forbidden
					},
					updatedAt: new Date()
				}
			}
		);

		throw redirect(303, `${adminPrefix()}/arm`);
	},
	delete: async function ({ params }) {
		const roleId = params.id;

		if (roleId === SUPER_ADMIN_ROLE_ID || roleId === POS_ROLE_ID) {
			throw error(403, 'You cannot delete this role');
		}

		if (await collections.users.countDocuments({ roleId }, { limit: 1 })) {
			throw error(403, 'This role is used by at least one user');
		}

		await collections.roles.deleteOne({
			_id: roleId
		});

		throw redirect(303, `${adminPrefix()}/arm`);
	}
};
