import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { cmsFromContent } from '$lib/server/cms';
import type { Product } from '$lib/types/Product';
import { omit } from 'lodash-es';

export const load = async ({ params, locals }) => {
	const product = await collections.products.findOne<
		Pick<
			Product,
			| '_id'
			| 'name'
			| 'price'
			| 'shortDescription'
			| 'description'
			| 'availableDate'
			| 'preorder'
			| 'customPreorderText'
			| 'type'
			| 'shipping'
			| 'displayShortDescription'
			| 'payWhatYouWant'
			| 'standalone'
			| 'maxQuantityPerOrder'
			| 'stock'
			| 'actionSettings'
			| 'contentBefore'
			| 'contentAfter'
			| 'deposit'
			| 'cta'
			| 'maximumPrice'
		>
	>(
		{ _id: params.id },
		{
			projection: {
				_id: 1,
				name: { $ifNull: [`$translations.${locals.language}.name`, '$name'] },
				price: 1,
				shortDescription: {
					$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
				},
				description: { $ifNull: [`$translations.${locals.language}.description`, '$description'] },
				availableDate: 1,
				preorder: 1,
				customPreorderText: {
					$ifNull: [`$translations.${locals.language}.customPreorderText`, '$customPreorderText']
				},
				type: 1,
				displayShortDescription: 1,
				payWhatYouWant: 1,
				standalone: 1,
				maxQuantityPerOrder: 1,
				stock: 1,
				actionSettings: 1,
				contentBefore: {
					$ifNull: [`$translations.${locals.language}.contentBefore`, '$contentBefore']
				},
				contentAfter: {
					$ifNull: [`$translations.${locals.language}.contentAfter`, '$contentAfter']
				},
				deposit: 1,
				cta: { $ifNull: [`$translations.${locals.language}.cta`, '$cta'] },
				maximumPrice: 1
			}
		}
	);

	if (!product) {
		const errorPage = await collections.cmsPages.findOne(
			{
				_id: 'error'
			},
			{
				projection: {
					content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
					title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
					shortDescription: {
						$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
					},
					fullScreen: 1,
					maintenanceDisplay: 1,
					hideFromSEO: 1
				}
			}
		);

		if (errorPage) {
			return {
				cmsPage: omit(errorPage, ['content']),
				cmsData: cmsFromContent(errorPage.content, locals),
				layoutReset: errorPage.fullScreen
			};
		} else {
			throw error(404, 'Page not found');
		}
	}
};
