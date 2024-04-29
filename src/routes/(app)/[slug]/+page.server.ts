import { collections } from '$lib/server/database';
import { omit } from 'lodash-es';
import { cmsFromContent } from '$lib/server/cms.js';
import { error, redirect } from '@sveltejs/kit';

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
				maintenanceDisplay: 1,
				hideFromSEO: 1
			}
		}
	);

	if (!cmsPage) {
		const errorPages = await collections.cmsPages.countDocuments({
			_id: 'error'
		});

		if (errorPages) {
			throw redirect(303, '/error');
		} else {
			throw error(404, 'Page not found');
		}
	}

	return {
		cmsPage: omit(cmsPage, ['content']),
		cmsData: cmsFromContent(cmsPage.content, locals),
		layoutReset: cmsPage.fullScreen
	};
}
