import { collections } from '$lib/server/database';
import * as devalue from 'devalue';

export const POST = async ({ request }) => {
	const { exportType } = JSON.parse(await request.text());

	const challenges = await collections.challenges.find().toArray();
	const cmsPages = await collections.cmsPages.find().toArray();
	const digitalFiles = await collections.digitalFiles.find().toArray();
	const orders = await collections.orders.find().toArray();
	const pictures = await collections.pictures.find().toArray();
	const products = await collections.products.find().toArray();
	const runtimeConfig = await collections.runtimeConfig.find().toArray();
	const bootikSubscriptions = await collections.bootikSubscriptions.find().toArray();
	const paidSubscriptions = await collections.paidSubscriptions.find().toArray();

	const dataToExport =
		exportType === 'product'
			? { products }
			: {
					challenges,
					cmsPages,
					digitalFiles,
					orders,
					pictures,
					products,
					runtimeConfig,
					bootikSubscriptions,
					paidSubscriptions
			  };

	const exportedDatabase = devalue.stringify(dataToExport);

	return new Response(exportedDatabase, {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': `attachment; filename=backup.json`
		}
	});
};
