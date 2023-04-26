import { collections } from '$lib/server/database.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { productToFrontend } from '$lib/types/Product.js';
import { UrlDependency } from '$lib/types/UrlDependency';
import { filterUndef } from '$lib/utils/filterUndef.js';

export async function load({ depends, locals }) {
	depends(UrlDependency.ExchangeRate);
	depends(UrlDependency.Cart);

	const cart = await collections.carts.findOne({ sessionId: locals.sessionId });

	return {
		exchangeRate: runtimeConfig.BTC_EUR,
		cart: cart
			? Promise.all(
					cart.items.map(async (item) => {
						const productDoc = await collections.products.findOne({ _id: item.productId });
						if (productDoc) {
							return {
								product: productToFrontend(productDoc),
								picture: await collections.pictures.findOne(
									{ productId: item.productId },
									{ sort: { createdAt: 1 } }
								),
								quantity: item.quantity
							};
						}
					})
			  ).then((res) => filterUndef(res))
			: null
	};
}
