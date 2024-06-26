import { checkCartItems } from '$lib/server/cart';
import { cmsFromContent } from '$lib/server/cms';
import { collections } from '$lib/server/database';
import { userIdentifier } from '$lib/server/user.js';

export async function load({ parent, locals }) {
	const parentData = await parent();

	if (parentData.cart) {
		try {
			await checkCartItems(parentData.cart, { user: userIdentifier(locals) });
		} catch (err) {
			if (
				typeof err === 'object' &&
				err &&
				'body' in err &&
				typeof err.body === 'object' &&
				err.body &&
				'message' in err.body &&
				typeof err.body.message === 'string'
			) {
				return { errorMessage: err.body.message };
			}
		}
	}
	const [cmsBasketTop, cmsBasketBottom] = await Promise.all([
		collections.cmsPages.findOne(
			{
				_id: 'cart-top'
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
		),
		collections.cmsPages.findOne(
			{
				_id: 'cart-bottom'
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
		)
	]);
	return {
		...(cmsBasketTop && {
			cmsBasketTop,
			cmsBasketTopData: cmsFromContent({ content: cmsBasketTop.content }, locals)
		}),
		...(cmsBasketBottom && {
			cmsBasketBottom,
			cmsBasketBottomData: cmsFromContent({ content: cmsBasketBottom.content }, locals)
		})
	};
}
