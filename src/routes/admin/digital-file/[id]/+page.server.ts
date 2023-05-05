import { S3_BUCKET } from '$env/static/private';
import { collections } from '$lib/server/database';
import { s3client } from '$lib/server/s3.js';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const digitalFile = await collections.digitalFiles.findOne({
		_id: params.id
	});

	if (!digitalFile) {
		throw error(404, 'Digital file not found');
	}

	const downloadLink = (
		await getSignedUrl(
			s3client,
			new GetObjectCommand({
				Bucket: S3_BUCKET,
				Key: digitalFile.storage.key
			}),
			{ expiresIn: 60 * 60 * 24 }
		)
	).replace('http:', 'https:');

	return {
		digitalFile,
		downloadLink
	};
}

export const actions = {
	delete: async function ({ params }) {
		const digitalFile = await collections.digitalFiles.findOne({ _id: params.id });

		if (!digitalFile) {
			throw error(404, 'Digital file not found');
		}

		await collections.digitalFiles.deleteOne({ _id: params.id });

		await s3client
			.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: digitalFile.storage.key }))
			.catch(console.error);

		throw redirect(303, '/admin/product/' + digitalFile.productId);
	},
	update: async function (input) {
		const formData = await input.request.formData();
		const name = String(formData.get('name'));

		await collections.digitalFiles.updateOne(
			{ _id: input.params.id },
			{
				$set: {
					name,
					updatedAt: new Date()
				}
			}
		);
	}
};
