import { collections } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { omit } from 'lodash-es';
import { cmsFromContent } from '$lib/server/cms.js';

export async function load({ params, locals }) {
	const cmsPage = await collections.cmsPages.findOne({
		_id: params.slug
	});

	if (!cmsPage) {
		throw error(404, 'CMS Page not found');
	}

	return {
		cmsPage: omit(cmsPage, ['content']),
		cmsData: cmsFromContent(cmsPage.content, locals.user?.roleId),
		layoutReset: cmsPage.fullScreen
	};
}
