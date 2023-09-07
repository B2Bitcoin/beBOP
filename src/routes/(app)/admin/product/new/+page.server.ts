import { collections, withTransaction } from '$lib/server/database';
import { generatePicture } from '$lib/server/picture';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { ORIGIN, S3_BUCKET } from '$env/static/private';
import { runtimeConfig } from '$lib/server/runtime-config';
import { MAX_NAME_LIMIT, type Product } from '$lib/types/Product';
import { Kind } from 'nostr-tools';
import { parsePriceAmount } from '$lib/types/Currency';
import { getS3DownloadLink, s3ProductPrefix, s3client } from '$lib/server/s3';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { productBaseSchema } from '../product-schema';
import { generateId } from '$lib/utils/generateId';
import { CopyObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';

export const load = async ({ url }) => {
	const productId = url.searchParams.get('duplicate_from');
	let product;
	let pictures;
	let digitalFiles;

	if (productId) {
		product = await collections.products.findOne({ _id: productId });

		pictures = await collections.pictures
			.find({ productId: productId })
			.sort({ createdAt: 1 })
			.toArray();

		digitalFiles = await collections.digitalFiles
			.find({ productId: productId })
			.sort({ createdAt: 1 })
			.toArray();

		return {
			product,
			productId,
			pictures,
			digitalFiles,
			currency: runtimeConfig.priceReferenceCurrency
		};
	}
};

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const parsed = z
			.object({
				slug: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				pictureId: z.string().trim().min(1).max(500),
				type: z.enum(['resource', 'donation', 'subscription']),
				...productBaseSchema
			})
			.parse({
				...json,
				availableDate: formData.get('availableDate') || undefined
			});

		if (await collections.products.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'Product with same slug already exists');
		}

		const priceAmount = parsed.free
			? 0
			: parsePriceAmount(parsed.priceAmount, parsed.priceCurrency, parsed.payWhatYouWant);

		if (parsed.type !== 'resource') {
			delete parsed.availableDate;
		}

		if (!parsed.availableDate) {
			delete parsed.availableDate;
			parsed.preorder = false;
		}

		if (parsed.type === 'donation') {
			parsed.shipping = false;
		}

		const pendingPicture = await collections.pendingPictures.findOne({
			_id: parsed.pictureId
		});

		if (!pendingPicture) {
			throw error(400, 'Error when uploading picture');
		}

		const resp = await fetch(await getS3DownloadLink(pendingPicture.storage.original.key));

		if (!resp.ok) {
			throw error(400, 'Error when uploading picture');
		}

		const buffer = await resp.arrayBuffer();

		await generatePicture(Buffer.from(buffer), parsed.name, {
			productId: parsed.slug,
			cb: async (session) => {
				await collections.products.insertOne(
					{
						_id: parsed.slug,
						createdAt: new Date(),
						updatedAt: new Date(),
						description: parsed.description.replaceAll('\r', ''),
						shortDescription: parsed.shortDescription.replaceAll('\r', ''),
						name: parsed.name,
						price: {
							currency: parsed.priceCurrency,
							amount: priceAmount
						},
						type: parsed.type,
						availableDate: parsed.availableDate || undefined,
						preorder: parsed.preorder,
						shipping: parsed.shipping,
						payWhatYouWant: parsed.payWhatYouWant,
						standalone: parsed.payWhatYouWant ? parsed.payWhatYouWant : parsed.standalone,
						free: parsed.free,
						displayShortDescription: parsed.displayShortDescription,
						...(parsed.deliveryFees && { deliveryFees: parsed.deliveryFees }),
						applyDeliveryFeesOnlyOnce: parsed.applyDeliveryFeesOnlyOnce,
						requireSpecificDeliveryFee: parsed.requireSpecificDeliveryFee
					},
					{ session }
				);

				await s3client
					.deleteObject({
						Key: pendingPicture.storage.original.key,
						Bucket: S3_BUCKET
					})
					.catch();

				await collections.pendingPictures.deleteOne({ _id: parsed.pictureId }, { session });
			}
		});

		onProductCreated({ _id: parsed.slug, name: parsed.name });

		throw redirect(303, '/admin/product/' + parsed.slug);
	},

	duplicate: async ({ request }) => {
		const formData = await request.formData();
		const json: JsonObject = {};

		for (const [key, value] of formData) {
			set(json, key, value);
		}

		const { productId: duplicatedProductId } = z
			.object({ productId: z.string() })
			.parse(Object.fromEntries(formData));

		const product = duplicatedProductId
			? await collections.products.findOne({ _id: duplicatedProductId })
			: undefined;

		if (!product) {
			throw error(404, 'Duplicated product not found');
		}

		const duplicate = z
			.object({
				slug: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				...productBaseSchema
			})
			.parse({
				...json,
				availableDate: formData.get('availableDate') || undefined
			});

		if (await collections.products.countDocuments({ _id: duplicate.slug })) {
			throw error(409, 'Product with same slug already exists');
		}

		if (!duplicate.availableDate) {
			duplicate.preorder = false;
		}

		if (product.type !== 'resource') {
			delete duplicate.availableDate;
			duplicate.preorder = false;
		}

		if (product.type === 'donation') {
			duplicate.shipping = false;
		}

		const insertedS3Keys: string[] = [];

		await withTransaction(async (session) => {
			await collections.products.insertOne(
				{
					_id: duplicate.slug,
					createdAt: new Date(),
					updatedAt: new Date(),
					description: duplicate.description.replaceAll('\r', ''),
					shortDescription: duplicate.shortDescription.replaceAll('\r', ''),
					name: duplicate.name,
					price: {
						currency: duplicate.priceCurrency,
						amount: parseFloat(duplicate.priceAmount)
					},
					type: product.type,
					availableDate: duplicate.availableDate || undefined,
					preorder: duplicate.preorder,
					shipping: duplicate.shipping,
					payWhatYouWant: duplicate.payWhatYouWant,
					standalone: duplicate.standalone,
					free: duplicate.free,
					displayShortDescription: duplicate.displayShortDescription
				},
				{ session }
			);

			const picturesToDuplicate = await collections.pictures
				.find({ productId: duplicatedProductId })
				.sort({ createdAt: 1 })
				.toArray();

			const digitalFilesToDuplicate = await collections.digitalFiles
				.find({ productId: duplicatedProductId })
				.sort({ createdAt: 1 })
				.toArray();

			const oldS3Prefix = s3ProductPrefix(duplicatedProductId);
			const newS3Prefix = s3ProductPrefix(duplicate.slug);

			for (const picture of picturesToDuplicate) {
				const pictureToInsert = {
					_id: generateId(picture._id.split('-').slice(0, -1).join('-'), true),
					name: picture.name,
					storage: {
						original: {
							...picture.storage.original,
							key: picture.storage.original.key.replace(oldS3Prefix, newS3Prefix)
						},
						formats: picture.storage.formats.map((format) => ({
							...format,
							key: format.key.replace(oldS3Prefix, newS3Prefix)
						}))
					},
					productId: duplicate.slug,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				insertedS3Keys.push(pictureToInsert.storage.original.key);
				await s3client.send(
					new CopyObjectCommand({
						Bucket: S3_BUCKET,
						CopySource: `/${S3_BUCKET}/${picture.storage.original.key}`,
						Key: pictureToInsert.storage.original.key
					})
				);

				let formatIndex = 0;
				for (const format of picture.storage.formats) {
					insertedS3Keys.push(format.key);
					await s3client.send(
						new CopyObjectCommand({
							Bucket: S3_BUCKET,
							CopySource: `/${S3_BUCKET}/${format.key}`,
							Key: pictureToInsert.storage.formats[formatIndex++].key
						})
					);
				}

				await collections.pictures.insertOne(pictureToInsert, { session });
			}

			for (const file of digitalFilesToDuplicate) {
				const digitalFileToInsert = {
					_id: generateId(file._id.split('-').slice(0, -1).join('-'), true),
					name: file.name,
					createdAt: new Date(),
					updatedAt: new Date(),
					storage: {
						...file.storage,
						key: file.storage.key.replace(oldS3Prefix, newS3Prefix)
					},
					productId: duplicate.slug
				};

				insertedS3Keys.push(digitalFileToInsert.storage.key);
				await s3client.send(
					new CopyObjectCommand({
						Bucket: S3_BUCKET,
						CopySource: `/${S3_BUCKET}/${file.storage.key}`,
						Key: digitalFileToInsert.storage.key
					})
				);

				await collections.digitalFiles.insertOne(digitalFileToInsert, { session });
			}
		}).catch((err) => {
			s3client
				.send(
					new DeleteObjectsCommand({
						Bucket: S3_BUCKET,
						Delete: {
							Objects: insertedS3Keys.map((key) => ({ Key: key }))
						}
					})
				)
				.catch(console.error);
			return err;
		});

		onProductCreated({ _id: duplicate.slug, name: duplicate.name });

		throw redirect(303, '/admin/product/' + duplicate.slug);
	}
};

// This could be a change stream on collections.product
function onProductCreated(product: Pick<Product, '_id' | 'name'>) {
	if (runtimeConfig.discovery) {
		(async function () {
			for await (const subscription of collections.bootikSubscriptions.find({
				npub: { $exists: true }
			})) {
				await collections.nostrNotifications
					.insertOne({
						_id: new ObjectId(),
						dest: subscription.npub,
						kind: Kind.EncryptedDirectMessage,
						content: `New product "${product.name}": ${ORIGIN}/product/${product._id}`,
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.catch(console.error);
			}
		})().catch(console.error);
	}
}
