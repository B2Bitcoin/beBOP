import type { Actions } from './$types';
import { generatePicture } from '$lib/server/picture';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { adminPrefix } from '$lib/server/admin';
import { TAGTYPES } from '$lib/types/Picture';

export const actions: Actions = {
	default: async (input) => {
		const formData = await input.request.formData();

		const fields = z
			.object({
				name: z.string(),
				productId: z.string().optional(),
				sliderId: z.string().optional(),
				tagId: z.string().optional(),
				tagType: z.enum([TAGTYPES[0], ...TAGTYPES.slice(1)]).optional(),
				pictureId: z.string().min(1).max(500)
			})
			.parse(Object.fromEntries(formData));

		await generatePicture(fields.pictureId, {
			productId: fields.productId || undefined,
			slider: fields.sliderId ? { _id: fields.sliderId } : undefined,
			tag: fields.tagId && fields.tagType ? { _id: fields.tagId, type: fields.tagType } : undefined
		});

		if (fields.productId) {
			throw redirect(303, `${adminPrefix()}/product/${fields.productId}`);
		}
		if (fields.sliderId) {
			throw redirect(303, '/admin/slider/' + fields.sliderId);
		}
		if (fields.tagId) {
			throw redirect(303, '/admin/tags/' + fields.tagId);
		}

		throw redirect(303, `${adminPrefix()}/picture`);
	}
};
