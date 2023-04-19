import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { deletePicture } from '$lib/server/picture';

export const load: PageServerLoad = async ({ params }) => {
	const picture = await collections.pictures.findOne({ _id: params.id });

	if (!picture) {
		throw error(404, 'Picture not found');
	}

	return {
		picture
	};
};

export const actions: Actions = {
	update: async function (input) {
		const name = String((await input.request.formData()).get('name'));
		await collections.pictures.updateOne(
			{ _id: input.params.id },
			{
				$set: {
					name,
					updatedAt: new Date()
				}
			}
		);

		return {};
	},
	delete: async function ({ params }) {
		const picture = await collections.pictures.findOne({ _id: params.id });

		if (!picture) {
			throw error(404);
		}

		await deletePicture(picture._id);

		throw redirect(
			303,
			picture.productId ? '/admin/product/' + picture.productId : '/admin/picture'
		);
	}
};
