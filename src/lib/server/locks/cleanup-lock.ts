import { Lock } from '$lib/server/lock';
import { subDays } from 'date-fns';
import { collections } from '../database';
import { processClosed } from '../process';
import { setTimeout } from 'node:timers/promises';
import { s3client } from '../s3';
import { S3_BUCKET } from '$env/static/private';

const lock = new Lock('cleanup');

async function cleanup() {
	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		try {
			const expiredFiles = await collections.pendingDigitalFiles
				.find({
					createdAt: {
						// 1 day should be enough, 2 days to be sure
						$lt: subDays(new Date(), 2)
					}
				})
				.toArray();

			for (const file of expiredFiles) {
				await s3client
					.deleteObject({
						Bucket: S3_BUCKET,
						Key: file.storage.key
					})
					.catch();

				await collections.pendingDigitalFiles.deleteOne({
					_id: file._id
				});
			}
		} catch (err) {
			console.error(err);
		}

		await setTimeout(5_000);
	}
}

cleanup();
