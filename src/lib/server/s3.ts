import { building } from '$app/environment';
import {
	S3_KEY_ID,
	S3_REGION,
	S3_KEY_SECRET,
	S3_ENDPOINT_URL,
	S3_BUCKET
} from '$env/static/private';
import * as AWS from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3client = building
	? (null as unknown as AWS.S3)
	: new AWS.S3({
			endpoint: S3_ENDPOINT_URL,
			region: S3_REGION,
			credentials: { accessKeyId: S3_KEY_ID, secretAccessKey: S3_KEY_SECRET }
	  });

if (s3client) {
	const buckets = await s3client.listBuckets({});

	if (!buckets.Buckets?.some((b) => b.Name === S3_BUCKET)) {
		await s3client.send(
			new AWS.CreateBucketCommand({
				Bucket: S3_BUCKET,
				CreateBucketConfiguration: {
					LocationConstraint: S3_REGION
				}
			})
		);
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
	if (['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) {
		return url;
	}

	return url.replace('http:', 'https:');
}

export async function getS3DownloadLink(key: string, expiresIn: number = 24 * 3600) {
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
export { s3client };
