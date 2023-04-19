import { S3_KEY_ID, S3_REGION, S3_KEY_SECRET, S3_ENDPOINT_URL } from '$env/static/private';
import * as AWS from '@aws-sdk/client-s3';

export const s3client = new AWS.S3({
	endpoint: S3_ENDPOINT_URL,
	region: S3_REGION,
	credentials: { accessKeyId: S3_KEY_ID, secretAccessKey: S3_KEY_SECRET }
});
