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

		console.log(json, parsed.deliveryFees);

		if (await collections.products.countDocuments({ _id: parsed.slug })) {
			throw error(409, 'Product with same slug already exists');
		}

		const priceAmount = parsed.priceAmount
			? parsePriceAmount(parsed.priceAmount, parsed.priceCurrency)
			: 0;

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
	}
};
