import { building } from '$app/environment';
import {
	S3_KEY_ID,
	S3_REGION,
	S3_KEY_SECRET,
	S3_ENDPOINT_URL,
	S3_BUCKET,
	ORIGIN
} from '$env/static/private';
import { PUBLIC_S3_ENDPOINT_URL } from '$env/static/public';
import * as AWS from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3client = building
	? (null as unknown as AWS.S3)
	: new AWS.S3({
			endpoint: S3_ENDPOINT_URL,
			region: S3_REGION,
			credentials: { accessKeyId: S3_KEY_ID, secretAccessKey: S3_KEY_SECRET },
			// Handle minio, eg http://minio:9000/bucket instead of http://bucket.minio:9000
			// Should work with any S3-compatible server, so no harm in leaving it on
			forcePathStyle: true
	  });

/**
 * To use with getSignedUrl. If PUBLIC_S3_ENDPOINT_URL is set, it will be used instead of S3_ENDPOINT_URL.
 */
const publicS3Client =
	building || !PUBLIC_S3_ENDPOINT_URL
		? s3client
		: new AWS.S3({
				endpoint: PUBLIC_S3_ENDPOINT_URL,
				region: S3_REGION,
				credentials: { accessKeyId: S3_KEY_ID, secretAccessKey: S3_KEY_SECRET },
				// Handle minio, eg http://minio:9000/bucket instead of http://bucket.minio:9000
				// Should work with any S3-compatible server, so no harm in leaving it on
				forcePathStyle: true
		  });

if (s3client) {
	const buckets = await s3client.listBuckets({});

	if (!buckets.Buckets?.some((b) => b.Name === S3_BUCKET)) {
		console.log('Creating S3 bucket...');
		await s3client.send(
			new AWS.CreateBucketCommand({
				Bucket: S3_BUCKET,
				CreateBucketConfiguration: {
					LocationConstraint: S3_REGION
				}
			})
		);
		console.log('S3 bucket created');
	}

	await s3client
		.send(
			new AWS.PutBucketCorsCommand({
				Bucket: S3_BUCKET,
				CORSConfiguration: {
					CORSRules: [
						{
							AllowedMethods: ['PUT'],
							// todo: change to production domain
							AllowedOrigins: ['*'],
							AllowedHeaders: ['*']
							// DO NOT SPECIFY: OVH S3 does not support this
							// ID: 'CORSRule1'
						}
					]
				}
			})
		)
		.catch(() => {} /* (err) => console.error('S3 CORS error: ', err) */);
}

export function secureLink(url: string) {
	if (
		['127.0.0.1', 'localhost'].includes(new URL(url).hostname) ||
		((PUBLIC_S3_ENDPOINT_URL || S3_ENDPOINT_URL)?.includes('http:') && ORIGIN?.includes('http:'))
	) {
		return url;
	}

	return url.replace('http:', 'https:');
}

/**
 * Call when the resulting URL is used in the browser.
 */
export async function getPublicS3DownloadLink(key: string, expiresIn: number = 7 * 24 * 3600) {
	return secureLink(
		await getSignedUrl(
			publicS3Client,
			new AWS.GetObjectCommand({
				Bucket: S3_BUCKET,
				Key: key
			}),
			{ expiresIn }
		)
	);
}

/**
 * Call when the resulting URL is used in the server.
 */
export async function getPrivateS3DownloadLink(key: string, expiresIn: number = 24 * 3600) {
	return secureLink(
		await getSignedUrl(
			s3client,
			new AWS.GetObjectCommand({
				Bucket: S3_BUCKET,
				Key: key
			}),
			{ expiresIn }
		)
	);
}

export function s3ProductPrefix(productId: string): string {
	return `products/${productId}/`;
}

export function s3TagPrefix(tagId: string): string {
	return `tags/${tagId}/`;
}
export function s3GalleryPrefix(galleryId: string): string {
	return `galleries/${galleryId}/`;
}
export { s3client, publicS3Client };
