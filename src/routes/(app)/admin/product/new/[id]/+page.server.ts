import { collections } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { generatePicture } from '$lib/server/picture';
import { MAX_NAME_LIMIT, MAX_SHORT_DESCRIPTION_LIMIT } from '$lib/types/Product';
import { generateId } from '$lib/utils/generateId';
import busboy from 'busboy';
import { streamToBuffer } from '$lib/server/utils/streamToBuffer';
import { pipeline } from 'nodemailer/lib/xoauth2';
import { ObjectId } from 'mongodb';
import { runtimeConfig } from '$lib/server/runtime-config';
import { Kind } from 'nostr-tools';
import { ORIGIN } from '$env/static/private';

export const load: PageServerLoad = async ({ params }) => {
	const product = await collections.products.findOne({ _id: params.id });

	if (!product) {
		throw error(404, 'Product not found');
	}

	const pictures = await collections.pictures
		.find({ productId: params.id })
		.sort({ createdAt: 1 })
		.toArray();

	const digitalFiles = await collections.digitalFiles
		.find({ productId: params.id })
		.sort({ createdAt: 1 })
		.toArray();

	return {
		product,
		pictures,
		digitalFiles
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();

		const product = await collections.products.findOne({ _id: params.id });

        const fields = {
            name: formData.get('name'),
            description: formData.get('description'),
            shortDescription: formData.get('shortDescription'),
            priceAmount: formData.get('priceAmount'),
            priceCurrency: formData.get('priceCurrency'),
            type: formData.get('type'),
            preorder: formData.get('preorder'),
            shipping: formData.get('shipping'),
            availableDate: formData.get('availableDate') || undefined,
            changedDate: formData.get('changedDate'),
            displayShortDescription: formData.get('displayShortDescription')
        };

		if (!product) {
			throw error(404, 'Product not found');
		}

		const parsed = z
			.object({
				name: z.string().trim().min(1).max(MAX_NAME_LIMIT),
				description: z.string().trim().max(10_000),
				shortDescription: z.string().trim().max(MAX_SHORT_DESCRIPTION_LIMIT),
				priceAmount: z.string().regex(/^\d+(\.\d+)?$/),
				priceCurrency: z.enum(['BTC']),
                type: z.enum(['resource', 'donation', 'subscription']),
				availableDate: z.date({ coerce: true }).optional(),
				changedDate: z.boolean({ coerce: true }).default(false),
				preorder: z.boolean({ coerce: true }).default(false),
				shipping: z.boolean({ coerce: true }).default(false),
				displayShortDescription: z.boolean({ coerce: true }).default(false)
			})
			.parse({
				name: formData.get('name'),
				description: formData.get('description'),
				shortDescription: formData.get('shortDescription'),
				priceAmount: formData.get('priceAmount'),
				priceCurrency: formData.get('priceCurrency'),
                type: formData.get('type'),
				preorder: formData.get('preorder'),
				shipping: formData.get('shipping'),
				availableDate: formData.get('availableDate') || undefined,
				changedDate: formData.get('changedDate'),
				displayShortDescription: formData.get('displayShortDescription')
			});

		if (product.type !== 'resource') {
			delete parsed.availableDate;
			parsed.preorder = false;
		}

		if (!parsed.changedDate) {
			delete parsed.availableDate;
		}

		const availableDate = product.availableDate || parsed.availableDate;
		if (!availableDate || availableDate < new Date()) {
			parsed.preorder = false;
		}

		if (product.type === 'donation') {
			parsed.shipping = false;
		}

        const productId = generateId(parsed.name, false);

		if (!productId) {
			throw error(400, 'Could not generate product ID');
		}

		if (await collections.products.countDocuments({ _id: productId })) {
			throw error(409, 'Product with same slug already exists');
		}

        // eslint-disable-next-line no-async-promise-executor
		const buffer = await new Promise<Buffer>(async (resolve, reject) => {
			try {
				const bb = busboy({
					headers: {
						'content-type': request.headers.get('content-type') ?? undefined
					}
				});
				bb.on('file', async (name, file /*, info */) => {
					// const { filename, encoding, mimeType } = info;
					resolve(await streamToBuffer(file));
				});
				bb.on('field', (name, val) => {
					if (name in fields) {
						fields[name as keyof typeof fields] = val;
					}
				});

				await pipeline(request.body as unknown as AsyncIterable<Buffer>, bb);
			} catch (err) {
				reject(err);
			}
		});

		await generatePicture(buffer, parsed.name, {
			productId,
			cb: async (session) => {
				await collections.products.insertOne(
					{
						_id: productId,
						createdAt: new Date(),
						updatedAt: new Date(),
						description: parsed.description.replaceAll('\r', ''),
						shortDescription: parsed.shortDescription.replaceAll('\r', ''),
						name: parsed.name,
						price: {
							currency: parsed.priceCurrency,
							amount: parseFloat(parsed.priceAmount)
						},
						type: parsed.type,
						availableDate: parsed.availableDate || undefined,
						preorder: parsed.preorder,
						shipping: parsed.shipping,
						displayShortDescription: parsed.displayShortDescription
					},
					{ session }
				);
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
							content: `New product "${parsed.name}": ${ORIGIN}/product/${productId}`,
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.catch(console.error);
				}
			})().catch(console.error);
		}

		throw redirect(303, '/admin/product/' + productId);
    }
};
