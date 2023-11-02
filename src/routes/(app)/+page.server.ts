import { load as cmsLoad } from './[slug]/+page.server';
import { load as catalogLoad } from './catalog/+page.server';

export const load = async ({ locals }) => {
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
			// @ts-expect-error only locals is needed
			catalog: catalogLoad({ locals: locals })
		};
	}
};
