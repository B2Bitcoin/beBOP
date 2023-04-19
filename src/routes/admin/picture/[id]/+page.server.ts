import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

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
		const res = await collections.pictures.findOneAndDelete({ _id: params.id });

		if (!res.value) {
			throw error(404);
		}

		throw redirect(
			303,
			res.value.productId ? '/admin/product/' + res.value.productId : '/admin/picture'
		);
	}
};
