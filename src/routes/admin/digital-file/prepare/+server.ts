import { S3_BUCKET } from '$env/static/private';
import { collections } from '$lib/server/database.js';
import { s3client } from '$lib/server/s3.js';
import { generateId } from '$lib/utils/generateId.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { error } from '@sveltejs/kit';
import * as mimeTypes from 'mime-types';
import { z } from 'zod';

export async function POST({ request, url }) {
	const body = z
		.object({
			name: z.string().trim().min(1).max(100),
			fileSize: z.number().int().min(1).max(100_000_000),
			fileName: z.string().trim().min(1).max(500),
			productId: z.string()
		})
		.parse(await request.json());

	const product = await collections.products.findOne({ _id: body.productId });

	if (!product) {
		throw error(404, 'The associated product does not exist');
	}

	const digitalFileId = generateId(body.name, true);

	const contentType = mimeTypes.lookup(body.fileName);
	const extension = contentType ? '.' + mimeTypes.extension(contentType) : '';

	const key = `products/${product._id}/${
		extension ? `${digitalFileId}.${extension}` : digitalFileId
	}`;

	const presignedUrl = await getSignedUrl(
		s3client,
		new PutObjectCommand({
			Bucket: S3_BUCKET,
			Key: key,
			...(contentType ? { ContentType: contentType } : {}),
			ContentLength: body.fileSize
		}),
		{ expiresIn: 60 * 60 * 24 }
	);

	await collections.pendingDigitalFiles.insertOne({
		_id: digitalFileId,
		name: body.name,
		createdAt: new Date(),
		updatedAt: new Date(),
		storage: {
			size: body.fileSize,
			key
		},
		productId: product._id
	});

	return new Response(JSON.stringify({ uploadUrl: presignedUrl, digitalFileId }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
