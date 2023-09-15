import { collections } from '$lib/server/database';
import type { CMSPage } from '$lib/types/CmsPage';

export function load() {
	return {
		cmsPages: collections.cmsPages
			.find({})
			.project<Pick<CMSPage, '_id' | 'title' | 'maintenanceDisplay'>>({
				_id: 1,
				title: 1,
				maintenanceDisplay: 1
			})
			.sort({ updatedAt: -1 })
			.toArray()
	};
}
