import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { deletePicture } from '$lib/server/picture';
import { runtimeConfig } from '$lib/server/runtime-config';
import { adminPrefix } from '$lib/server/admin';

export const load = async ({ params }) => {
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
			picture.productId
				? `${adminPrefix()}/product/${picture.productId}`
				: `${adminPrefix()}/picture`
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
				_id: 'logo'
			},
			{
				$set: {
					'data.pictureId': picture._id,
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);
		runtimeConfig.logo.pictureId = picture._id;
	},

	removeLogo: async function ({ params }) {
		if (runtimeConfig.logo.pictureId === params.id) {
			await collections.runtimeConfig.updateOne(
				{
					_id: 'logo',
					data: params.id
				},
				{
					$set: {
						'data.pictureId': '',
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
			runtimeConfig.logo.pictureId = '';
		}
	},
	setAsDarkLogo: async function ({ params }) {
		const picture = await collections.pictures.findOne({ _id: params.id });

		if (!picture) {
			throw error(404);
		}

		if (picture.productId) {
			throw error(400, 'Picture is already associated to a product');
		}

		await collections.runtimeConfig.updateOne(
			{
				_id: 'logo'
			},
			{
				$set: {
					'data.darkModePictureId': picture._id,
					updatedAt: new Date()
				}
			},
			{
				upsert: true
			}
		);
		runtimeConfig.logo.darkModePictureId = picture._id;
	},

	removeDarkLogo: async function ({ params }) {
		if (runtimeConfig.logo.pictureId === params.id) {
			await collections.runtimeConfig.updateOne(
				{
					_id: 'logo',
					data: params.id
				},
				{
					$set: {
						'data.darkModePictureId': '',
						updatedAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
			runtimeConfig.logo.darkModePictureId = '';
		}
	}
};
