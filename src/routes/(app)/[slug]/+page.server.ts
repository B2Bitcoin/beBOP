import { collections } from '$lib/server/database';
import { omit } from 'lodash-es';
import { cmsFromContent } from '$lib/server/cms.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	let cmsPage = await collections.cmsPages.findOne(
		{
			_id: params.slug
		},
		{
			projection: {
				content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
				substitutionContent: {
					$ifNull: [`$translations.${locals.language}.substitutionContent`, '$substitutionContent']
				},
				title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
				shortDescription: {
					$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
				},
				fullScreen: 1,
				maintenanceDisplay: 1,
				hideFromSEO: 1,
				hasSubstitutionContent: 1
			}
		}
	);

	if (!cmsPage) {
		cmsPage = await collections.cmsPages.findOne(
			{
				_id: 'error'
			},
			{
				projection: {
					content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
					substitutionContent: {
						$ifNull: [
							`$translations.${locals.language}.substitutionContent`,
							'$substitutionContent'
						]
					},
					title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
					shortDescription: {
						$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
					},
					fullScreen: 1,
					maintenanceDisplay: 1,
					hideFromSEO: 1,
					hasSubstitutionContent: 1
				}
			}
		);

		if (!cmsPage) {
			throw error(404, 'Page not found');
		}
	}

	return {
		cmsPage: omit(cmsPage, ['content']),
		cmsData: cmsFromContent(cmsPage.content, locals),
		layoutReset: cmsPage.fullScreen,
		...(cmsPage.hasSubstitutionContent &&
			cmsPage.substitutionContent && {
				cmsDataSubstitute: cmsFromContent(cmsPage.substitutionContent, locals)
			})
	};
}
