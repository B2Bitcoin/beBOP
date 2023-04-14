import { S3_KEY_ID } from '$env/static/private';
import { S3_KEY_SECRET } from '$env/static/private';
import { S3_ENDPOINT_URL } from '$env/static/private';
import * as AWS from '@aws-sdk/client-s3';

export const s3client = new AWS.S3({
	endpoint: S3_ENDPOINT_URL,
	credentials: { accessKeyId: S3_KEY_ID, secretAccessKey: S3_KEY_SECRET }
});
