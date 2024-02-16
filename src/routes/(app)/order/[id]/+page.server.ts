import { collections } from '$lib/server/database';
import { UrlDependency } from '$lib/types/UrlDependency';
import { redirect } from '@sveltejs/kit';
import { fetchOrderForUser } from './fetchOrderForUser.js';
import { getPublicS3DownloadLink } from '$lib/server/s3.js';
import { uniqBy } from '$lib/utils/uniqBy.js';
import { paymentMethods } from '$lib/server/payment-methods.js';

export async function load({ params, depends, locals }) {
	depends(UrlDependency.Order);

	const order = await fetchOrderForUser(params.id);

	const digitalFiles = uniqBy(
		order.items.flatMap((item) => item.digitalFiles),
		(file) => file._id
	);

	return {
		order,
		paymentMethods: paymentMethods(locals.user?.roleId),
		digitalFiles: Promise.all(
			digitalFiles.map(async (file) => ({
				name: file.name,
				size: file.storage.size,
				link: order.status === 'paid' ? await getPublicS3DownloadLink(file.storage.key) : undefined
			}))
		)
	};
}

export const actions = {
	cancel: async function ({ params, request }) {
		await collections.orders.updateOne(
			{
				_id: params.id,
				status: 'pending'
			},
			{
				$set: {
					status: 'canceled'
				}
			}
		);

		throw redirect(303, request.headers.get('referer') || '/');
	}
};
