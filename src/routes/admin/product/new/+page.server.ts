import { collections } from '$lib/server/database';
import { generatePicture } from '$lib/server/picture';
import { generateId } from '$lib/utils/generateId';
import type { Actions } from './$types';
import { pipeline } from 'node:stream/promises';
import { Decimal128 } from 'mongodb';
import busboy from 'busboy';
import { streamToBuffer } from '$lib/server/utils/streamToBuffer';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const actions: Actions = {
	default: async ({ request }) => {
		const fields = {
			name: '',
			description: '',
			priceAmount: '',
			priceCurrency: ''
		};

		// eslint-disable-next-line no-async-promise-executor
		const buffer = await new Promise<Buffer>(async (resolve, reject) => {
			try {
				const bb = busboy({
					headers: {
						'content-type': request.headers.get('content-type') ?? undefined
					}
				});
				bb.on('file', async (name, file, info) => {
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

		const productId = generateId(fields.name);

		const parsed = z
			.object({
				name: z.string().trim().min(1).max(100),
				description: z.string().trim().max(10_000),
				priceCurrency: z.enum(['BTC']),
				priceAmount: z.string().regex(/^\d+(\.\d+)?$/)
			})
			.parse(fields);

		await generatePicture(buffer, fields.name, {
			productId,
			cb: async (session) => {
				await collections.products.insertOne(
					{
						_id: productId,
						createdAt: new Date(),
						updatedAt: new Date(),
						description: parsed.description.replaceAll('\r', ''),
						name: parsed.name,
						price: {
							currency: parsed.priceCurrency,
							amount: new Decimal128(parsed.priceAmount)
						}
					},
					{ session }
				);
			}
		});

		throw redirect(303, '/admin/product/' + productId);
	}
};
