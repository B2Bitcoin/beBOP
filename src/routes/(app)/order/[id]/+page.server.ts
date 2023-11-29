import { collections } from '$lib/server/database';
import { UrlDependency } from '$lib/types/UrlDependency';
import { getConfirmationBlocks } from '$lib/utils/getConfirmationBlocks.js';
import { redirect } from '@sveltejs/kit';
import { fetchOrderForUser } from './fetchOrderForUser.js';
import { getS3DownloadLink } from '$lib/server/s3.js';
import { uniqBy } from '$lib/utils/uniqBy.js';

export async function load({ params, depends }) {
	depends(UrlDependency.Order);

	const order = await fetchOrderForUser(params.id);

	const digitalFiles = uniqBy(
		order.items.flatMap((item) => item.digitalFiles),
		(file) => file._id
	);

	return {
		confirmationBlocksRequired: getConfirmationBlocks(order.totalPrice.amount),
		order,
		digitalFiles: Promise.all(
			digitalFiles.map(async (file) => ({
				name: file.name,
				size: file.storage.size,
				link:
					order.payment.status === 'paid' ? await getS3DownloadLink(file.storage.key) : undefined
			}))
		)
	};
}

export const actions = {
	cancel: async function ({ params, request }) {
		await collections.orders.updateOne(
			{
				_id: params.id,
				'payment.status': 'pending'
			},
			{
				$set: {
					'payment.status': 'canceled'
				}
			}
		);

		throw redirect(303, request.headers.get('referer') || '/');
	}
};
