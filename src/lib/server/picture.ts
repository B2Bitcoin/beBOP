import sharp from 'sharp';
import { client, collections } from '$lib/server/database';
import { generateId } from '$lib/utils/generateId';
import type { ClientSession } from 'mongodb';
import { error } from '@sveltejs/kit';
import { s3client } from './s3';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3_BUCKET } from '$env/static/private';
import * as mimeTypes from 'mime-types';
import type { ImageData, Picture } from '../types/Picture';

/**
 * Upload picture to S3 under different formats, and create a document in db.pictures.
 *
 * You can associate the picture to a product, and you can pass a callback called at the end that if it fails,
 * will cancel everything (remove from DB and S3)
 */
export async function generatePicture(
	buffer: Buffer,
	name: string,
	opts?: { productId?: string; cb?: (session: ClientSession) => Promise<void> }
): Promise<void> {
	const image = sharp(buffer);
	const { width, height, format } = await image.metadata();

	if (!width || !height) {
		throw error(400, 'Invalid image: no height or width');
	}

	if (!format) {
		throw error(400, 'Invalid image format');
	}

	const mime = mimeTypes.lookup(format);

	if (!mime) {
		throw error(400, 'Invalid image format: ' + format);
	}

	const _id = generateId(name);
	const extension = '.' + mimeTypes.extension(mime);

	const uploadedKeys: string[] = [];

	const pathPrefix = opts?.productId ? `products/${opts.productId}/` : `pictures/`;

	const path = `${pathPrefix}${_id}${extension}`;

	await s3client.send(
		new PutObjectCommand({
			Bucket: S3_BUCKET,
			Key: path,
			Body: buffer,
			ContentType: mime
		})
	);
	uploadedKeys.push(path);

	const original = {
		key: path,
		width,
		height,
		size: buffer.length
	};

	const formats: ImageData[] = [];

	try {
		if (width <= 2048 && height <= 2048) {
			const key = `${pathPrefix}${_id}-${width}x${height}.webp`;
			const buffer = await image.toFormat('webp').toBuffer();
			await s3client.send(
				new PutObjectCommand({
					Bucket: S3_BUCKET,
					Key: key,
					Body: buffer,
					ContentType: 'image/webp'
				})
			);

			uploadedKeys.push(key);

			formats.push({
				width,
				height,
				key,
				size: buffer.length
			});
		}

		for (const size of [2048, 1024, 512]) {
			if (width > size || height > size) {
				const buffer = await image
					.resize(width > height ? { width: size } : { height: size })
					.toFormat('webp')
					.toBuffer();

				// Is it possible to get the new width and height as an intermediate step of the above call instead?
				const { width: newWidth, height: newHeight } = await sharp(buffer).metadata();

				const key = `${pathPrefix}${_id}-${newWidth}x${newHeight}.webp`;
				await s3client.send(
					new PutObjectCommand({
						Bucket: S3_BUCKET,
						Key: key,
						Body: buffer,
						ContentType: 'image/webp'
					})
				);

				uploadedKeys.push(key);

				formats.push({
					width: newWidth!,
					height: newHeight!,
					key,
					size: buffer.length
				});
			}
		}

		await client.withSession(async (session) => {
			await collections.pictures.insertOne(
				{
					_id,
					name,
					storage: {
						original,
						formats
					},
					...(opts?.productId && { productId: opts.productId }),
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{ session }
			);

			if (opts?.cb) {
				await opts.cb(session);
			}
		});
	} catch (err) {
		// Remove uploaded files
		for (const key of uploadedKeys) {
			s3client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })).catch();
		}
		throw err;
	}
}

export async function deletePicture(pictureId: Picture['_id']) {
	const res = await collections.pictures.findOneAndDelete({ _id: pictureId });

	if (!res.value) {
		return;
	}

	for (const format of res.value.storage.formats) {
		await s3client
			.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: format.key }))
			.catch(console.error);
	}

	await s3client
		.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: res.value.storage.original.key }))
		.catch(console.error);
}
