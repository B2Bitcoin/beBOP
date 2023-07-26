import { collections } from '$lib/server/database';
import { generatePicture } from '$lib/server/picture';
import type { Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { ORIGIN, S3_BUCKET } from '$env/static/private';
import { runtimeConfig } from '$lib/server/runtime-config';
import { MAX_NAME_LIMIT } from '$lib/types/Product';
import { Kind } from 'nostr-tools';
import { parsePriceAmount } from '$lib/types/Currency';
import { getS3DownloadLink, s3client } from '$lib/server/s3';
import type { JsonObject } from 'type-fest';
import { set } from 'lodash-es';
import { productBaseSchema } from '../product-schema';
import { generateId } from '$lib/utils/generateId';
import { CopyObjectCommand } from '@aws-sdk/client-s3';

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
	default: async ({ request }) => {
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

		const priceAmount = parsePriceAmount(parsed.priceAmount, parsed.priceCurrency);

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

		// This could be a change stream on collections.product, but for now a bit simpler
		// to put it here.
		// Later, if we have more notification types or more places where a product can be created,
		// a change stream would probably be better
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
							content: `New product "${parsed.name}": ${ORIGIN}/product/${parsed.slug}`,
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.catch(console.error);
				}
			})().catch(console.error);
		}

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
				pictureId: z.string().trim().min(1).max(500),
				type: z.enum(['resource', 'donation', 'subscription']),
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

		await collections.products.insertOne({
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
			displayShortDescription: duplicate.displayShortDescription
		});

		const picturesToDuplicate = await collections.pictures
			.find({ productId: duplicatedProductId })
			.sort({ createdAt: 1 })
			.toArray();

		const digitalFilesToDuplicate = await collections.digitalFiles
			.find({ productId: duplicatedProductId })
			.sort({ createdAt: 1 })
			.toArray();

		const picturesToInsert = picturesToDuplicate.map((picture) => {
			return {
				_id: generateId(picture._id.split('-').slice(0, -1).join('-'), true),
				name: picture.name,
				storage: picture.storage,
				productId: duplicate.slug,
				createdAt: new Date(),
				updatedAt: new Date()
			};
		});
		const digitalFilesToInsert = digitalFilesToDuplicate.map((file) => {
			return {
				_id: generateId(file._id.split('-').slice(0, -1).join('-'), true),
				name: duplicate.name,
				createdAt: new Date(),
				updatedAt: new Date(),
				storage: file.storage,
				productId: duplicate.slug
			};
		});

		try {
			await s3client.send(
				new CopyObjectCommand({
					Bucket: S3_BUCKET,
					CopySource: `/${S3_BUCKET}/${picturesToDuplicate[0].storage.original.key}`,
					Key: duplicate.name.split(' ').join('-')
				})
			);
			console.log('Document duplicated successfully');
		} catch (error) {
			console.error('Error duplicating document: ', error);
		}

		await collections.pictures.insertMany(picturesToInsert);
		await collections.digitalFiles.insertMany(digitalFilesToInsert);

		// This could be a change stream on collections.product, but for now a bit simpler
		// to put it here.
		// Later, if we have more notification types or more places where a product can be created,
		// a change stream would probably be better
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
							content: `New product "${duplicate.name}": ${ORIGIN}/product/${duplicate.slug}`,
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.catch(console.error);
				}
			})().catch(console.error);
		}

		throw redirect(303, '/admin/product/' + duplicate.slug);
	}
};
