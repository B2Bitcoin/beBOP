import sharp from 'sharp';
import { collections, withTransaction } from '$lib/server/database';
import { generateId } from '$lib/utils/generateId';
import type { ClientSession } from 'mongodb';
import { error } from '@sveltejs/kit';
import { s3ProductPrefix, s3TagPrefix, s3client } from './s3';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3_BUCKET } from '$env/static/private';
import * as mimeTypes from 'mime-types';
import type { ImageData, Picture, TagType } from '../types/Picture';

/**
 * Upload picture to S3 under different formats, and create a document in db.pictures.
 *
 * You can associate the picture to a product, and you can pass a callback called at the end that if it fails,
 * will cancel everything (remove from DB and S3)
 */
export async function generatePicture(
	buffer: Buffer | Uint8Array,
	name: string,
	opts?: {
		productId?: string;
		tag?: { _id: string; type: TagType };
		slider?: { _id: string; url?: string; openNewTab?: boolean };
		cb?: (session: ClientSession) => Promise<void>;
	}
): Promise<void> {
	if (buffer.length > 10 * 1024 * 1024) {
		throw error(400, 'Image too big, 10MB max');
	}

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

	const _id = generateId(name, true);
	const extension = '.' + mimeTypes.extension(mime);

	const uploadedKeys: string[] = [];

	const pathPrefix = opts?.productId
		? s3ProductPrefix(opts.productId)
		: opts?.tag
		? s3TagPrefix(opts.tag._id)
		: opts?.slider
		? s3TagPrefix(opts.slider._id)
		: `pictures/`;

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

		for (const size of [2048, 1024, 512, 256, 128]) {
			if (width > size || height > size) {
				const buffer = await image
					.resize(width > height ? { width: size } : { height: size })
					.toFormat('webp')
					.toBuffer();

				// Is it possible to get the new width and height as an intermediate step of the above call instead?
				const { width: newWidth, height: newHeight } = await sharp(buffer).metadata();

				if (!newWidth || !newHeight) {
					throw error(500, 'Could not get resized width and height');
				}

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
					width: newWidth,
					height: newHeight,
					key,
					size: buffer.length
				});
			}
		}

		await withTransaction(async (session) => {
			await collections.pictures.insertOne(
				{
					_id,
					name,
					storage: {
						original,
						formats
					},
					...(opts?.productId && { productId: opts.productId }),
					...(opts?.tag && { tag: { _id: opts?.tag._id, type: opts?.tag.type } }),
					...(opts?.slider && {
						slider: {
							_id: opts?.slider._id,
							...(opts.slider.url && { url: opts.slider.url, openNewTab: opts.slider.openNewTab })
						}
					}),
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

export function picturesForProducts(productIds: string[]): Promise<Picture[]> {
	return collections.pictures
		.aggregate<Picture>([
			{ $match: { productId: { $in: productIds } } },
			{ $sort: { createdAt: 1 } },
			{
				$group: {
					_id: '$productId',
					value: { $first: '$$ROOT' }
				}
			},
			{ $replaceRoot: { newRoot: '$value' } }
		])
		.toArray();
}

export function pictureIdsForProducts(productIds: string[]): Promise<string[]> {
	return collections.pictures
		.aggregate<Pick<Picture, '_id'>>([
			{ $match: { productId: { $in: productIds } } },
			{ $sort: { createdAt: 1 } },
			{ $project: { _id: 1 } },
			{
				$group: {
					_id: '$productId',
					value: { $first: '$$ROOT' }
				}
			},
			{ $replaceRoot: { newRoot: '$value' } }
		])
		.map((picture) => picture._id)
		.toArray();
}
