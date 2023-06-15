import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { deletePicture } from '$lib/server/picture';
import { runtimeConfig } from '$lib/server/runtime-config';

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
	},

	setAsLogo: async function ({ params }) {
		const picture = await collections.pictures.findOne({ _id: params.id });

		if (!picture) {
			throw error(404);
		}

		if (picture.productId) {
			throw error(400, 'Picture is already associated to a product');
		}

		await collections.runtimeConfig.updateOne(
			{
				_id: 'logoPictureId'
			},
			{
				$set: {
					data: picture._id,
					updatedAt: new Date()
				}
			}
		);
		runtimeConfig.logoPictureId = picture._id;
	},

	removeLogo: async function ({ params }) {
		if (runtimeConfig.logoPictureId === params.id) {
			await collections.runtimeConfig.updateOne(
				{
					_id: 'logoPictureId',
					data: params.id
				},
				{
					$set: {
						data: '',
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
			runtimeConfig.logoPictureId = '';
		}
	}
};
