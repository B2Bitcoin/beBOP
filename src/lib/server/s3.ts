import {
	S3_KEY_ID,
	S3_REGION,
	S3_KEY_SECRET,
	S3_ENDPOINT_URL,
	S3_BUCKET
} from '$env/static/private';
import * as AWS from '@aws-sdk/client-s3';

const s3client = new AWS.S3({
	endpoint: S3_ENDPOINT_URL,
	region: S3_REGION,
	credentials: { accessKeyId: S3_KEY_ID, secretAccessKey: S3_KEY_SECRET }
});

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
						AllowedHeaders: ['*'],
						ID: 'CORSRule1'
					}
				]
			}
		})
	)
	.catch((err) => console.error('S3 CORS error: ', err));

export function secureDownloadLink(url: string) {
	if (['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) {
		return url;
	}

	return url.replace('http:', 'https:');
}

export { s3client };
