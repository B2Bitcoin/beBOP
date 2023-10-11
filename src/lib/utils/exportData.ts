import { collections } from '../server/database';
import * as devalue from 'devalue';

export async function exportDatabase() {
	try {
		const challenges = await collections.challenges.find().toArray();
		const cmsPages = await collections.cmsPages.find().toArray();
		const digitalFiles = await collections.digitalFiles.find().toArray();
		const orders = await collections.orders.find().toArray();
		const pictures = await collections.pictures.find().toArray();
		const products = await collections.products.find().toArray();
		const runtimeConfig = await collections.runtimeConfig.find().toArray();
		const bootikSubscriptions = await collections.bootikSubscriptions.find().toArray();
		const paidSubscriptions = await collections.paidSubscriptions.find().toArray();

		const dataToExport = {
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

		return devalue.stringify(dataToExport);
	} catch (error) {
		console.error('Error exporting database:', error);
		throw error;
	}
}
