import type { Actions } from './$types';
import { generatePicture } from '$lib/server/picture';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { adminPrefix } from '$lib/server/admin';

export const actions: Actions = {
	default: async (input) => {
		const formData = await input.request.formData();

		const fields = z
			.object({
				name: z.string(),
				productId: z.string().optional(),
				sliderId: z.string().optional(),
				picture: z.instanceof(File)
			})
			.parse(Object.fromEntries(formData));

		await generatePicture(new Uint8Array(await fields.picture.arrayBuffer()), fields.name, {
			productId: fields.productId || undefined,
			slider: fields.sliderId ? { _id: fields.sliderId } : undefined
		});

		if (fields.productId) {
			throw redirect(303, `${adminPrefix()}/product/${fields.productId}`);
		}
		if (fields.sliderId) {
			throw redirect(303, '/admin/slider/' + fields.sliderId);
		}

		throw redirect(303, `${adminPrefix()}/picture`);
	}
};
