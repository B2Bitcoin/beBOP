import { collections } from '$lib/server/database';
import { omit } from 'lodash-es';
import { load as catalogLoad } from './catalog/+page.server';
import { cmsFromContent } from '$lib/server/cms';

export const load = async ({ locals }) => {
	const cmsPage = await collections.cmsPages.findOne({
		_id: 'home'
	});

	if (!cmsPage) {
		return {
			// @ts-expect-error only locals is needed
			catalog: catalogLoad({ locals: locals })
		};
	}

	return {
		cmsPage: omit(cmsPage, ['content']),
		cmsData: cmsFromContent(cmsPage.content, locals),
		layoutReset: cmsPage.fullScreen
	};
};
