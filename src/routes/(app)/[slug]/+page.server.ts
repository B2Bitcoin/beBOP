import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { omit } from 'lodash-es';
import { cmsFromContent } from '$lib/server/cms.js';

export async function load({ params, locals }) {
	const cmsPage = await collections.cmsPages.findOne(
		{
			_id: params.slug
		},
		{
			projection: {
				content: { $ifNull: [`$translations.${locals.language}.content`, '$content'] },
				title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
				shortDescription: {
					$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
				},
				fullScreen: 1,
				maintenanceDisplay: 1
			}
		}
	);

	if (!cmsPage) {
		throw error(404, 'CMS Page not found');
	}

	return {
		cmsPage: omit(cmsPage, ['content']),
		cmsData: cmsFromContent(cmsPage.content, locals),
		layoutReset: cmsPage.fullScreen
	};
}
