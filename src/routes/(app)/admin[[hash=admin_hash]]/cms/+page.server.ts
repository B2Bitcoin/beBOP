import { collections } from '$lib/server/database';
import type { CMSPage } from '$lib/types/CmsPage';

export function load({ locals }) {
	return {
		cmsPages: collections.cmsPages
			.find({})
			.project<
				Pick<CMSPage, '_id' | 'title' | 'maintenanceDisplay' | 'hasMobileContent' | 'metas'>
			>({
				_id: 1,
				title: { $ifNull: [`$translations.${locals.language}.title`, '$title'] },
				maintenanceDisplay: 1,
				hasMobileContent: 1,
				metas: 1
			})
			.sort({ updatedAt: -1 })
			.toArray()
	};
}
