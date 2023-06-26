import { load as cmsLoad } from './(app)/[slug]/+page.server';
import { load as catalogLoad } from './(app)/catalog/+page.server';

export const load = async () => {
	try {
		return {
			// @ts-expect-error only params is needed
			cms: await cmsLoad({ params: { slug: 'home' } })
		};
	} catch (e) {
		// also, body: { message: 'CMS Page not found' }
		const is404 = e && typeof e === 'object' && 'status' in e && e.status === 404;
		if (!is404) {
			throw e;
		}

		return {
			catalog: catalogLoad()
		};
	}
};
