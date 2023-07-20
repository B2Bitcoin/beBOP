import { S3_BUCKET } from '$env/static/private';
import { collections } from '$lib/server/database.js';
import { s3client, secureLink } from '$lib/server/s3.js';
import { generateId } from '$lib/utils/generateId.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as mimeTypes from 'mime-types';
import { z } from 'zod';

export async function POST({ request }) {
	const body = z
		.object({
			fileSize: z.number().int().min(1).max(20_000_000),
			fileName: z.string().trim().min(1).max(500)
		})
		.parse(await request.json());

	const pictureId = generateId(body.fileName, true);

	const contentType = mimeTypes.lookup(body.fileName);
	const extension = contentType ? mimeTypes.extension(contentType) : '';

	const key = `pending/${extension ? `${pictureId}.${extension}` : pictureId}`;

	const presignedUrl = secureLink(
		await getSignedUrl(
			s3client,
			new PutObjectCommand({
				Bucket: S3_BUCKET,
				Key: key,
				...(contentType ? { ContentType: contentType } : {}),
				ContentLength: body.fileSize
			}),
			{ expiresIn: 60 * 60 * 24 }
		)
	);

	await collections.pendingPictures.insertOne({
		_id: pictureId,
		name: body.fileName,
		createdAt: new Date(),
		updatedAt: new Date(),
		storage: {
			formats: [],
			original: {
				key,
				size: body.fileSize,
				height: 0,
				width: 0
			}
		}
	});

	return new Response(JSON.stringify({ uploadUrl: presignedUrl, pictureId }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
