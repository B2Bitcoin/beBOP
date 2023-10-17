import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';

export const load: PageServerLoad = async ({ params }) => {
	const seat = await collections.seats.findOne({ _id: params.id });

	if (!seat) {
		throw error(404, 'Seat not found');
	}

	return {
		seat
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();

		const { login, password } = z
			.object({
				login: z.string(),
				password: z.string()
			})
			.parse({
				login: data.get('login'),
				password: data.get('password')
			});

		const updatedValueSeat: { login: string; password?: string } = {
			login
		};

		if (password) {
			const salt = await bcryptjs.genSalt(10);
			const passwordBcrypt = await bcryptjs.hash(password, salt);
			updatedValueSeat.password = passwordBcrypt;
		}

		await collections.seats.updateOne(
			{ _id: params.id },
			{
				$set: updatedValueSeat
			}
		);

		return {};
	},

	delete: async ({ params }) => {
		await collections.seats.deleteOne({ _id: params.id });

		throw redirect(303, '/admin/pos');
	}
};
