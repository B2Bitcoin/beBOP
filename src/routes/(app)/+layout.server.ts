import { countryNameByAlpha2 } from '$lib/server/country-codes';
import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { vatRates } from '$lib/server/vat-rates';
import type { Product } from '$lib/types/Product';
import { UrlDependency } from '$lib/types/UrlDependency';
import { filterUndef } from '$lib/utils/filterUndef';

export async function load({ depends, locals }) {
	depends(UrlDependency.ExchangeRate);
	depends(UrlDependency.Cart);

	const cart = await collections.carts.findOne({ sessionId: locals.sessionId });

	const logoPicture = runtimeConfig.logoPictureId
		? await collections.pictures.findOne({ _id: runtimeConfig.logoPictureId })
		: null;

	return {
		isMaintenance: runtimeConfig.isMaintenance,
		vatExempted: runtimeConfig.vatExempted,
		exchangeRate: {
			BTC_EUR: runtimeConfig.BTC_EUR,
			BTC_USD: runtimeConfig.BTC_USD,
			BTC_CHF: runtimeConfig.BTC_CHF,
			BTC_SAT: runtimeConfig.BTC_SAT
		},
		countryCode: locals.countryCode,
		countryName: countryNameByAlpha2[locals.countryCode] || '-',
		vatRate: runtimeConfig.vatExempted
			? 0
			: runtimeConfig.vatSingleCountry
			? runtimeConfig.vatCountry in vatRates
				? vatRates[runtimeConfig.vatCountry as keyof typeof vatRates]
				: 0
			: locals.countryCode in vatRates
			? vatRates[locals.countryCode as keyof typeof vatRates]
			: 0,
		vatSingleCountry: runtimeConfig.vatSingleCountry,
		vatCountry: runtimeConfig.vatSingleCountry ? runtimeConfig.vatCountry : locals.countryCode,
		currencies: {
			main: runtimeConfig.mainCurrency,
			secondary: runtimeConfig.secondaryCurrency,
			priceReference: runtimeConfig.priceReferenceCurrency
		},
		brandName: runtimeConfig.brandName,
		logoPicture,
		links: {
			footer: runtimeConfig.footerLinks,
			navbar: runtimeConfig.navbarLinks,
			topbar: runtimeConfig.topbarLinks
		},
		logo: runtimeConfig.logoPictureId,
		sessionSvelteKit: await locals.getSession(),
		cart: cart
			? Promise.all(
					cart.items.map(async (item) => {
						const productDoc = await collections.products.findOne<
							Pick<
								Product,
								| '_id'
								| 'name'
								| 'price'
								| 'shortDescription'
								| 'type'
								| 'availableDate'
								| 'shipping'
								| 'preorder'
								| 'deliveryFees'
								| 'applyDeliveryFeesOnlyOnce'
								| 'requireSpecificDeliveryFee'
								| 'payWhatYouWant'
								| 'standalone'
							>
						>(
							{ _id: item.productId },
							{
								projection: {
									_id: 1,
									name: 1,
									price: 1,
									shortDescription: 1,
									type: 1,
									shipping: 1,
									availableDate: 1,
									preorder: 1,
									deliveryFees: 1,
									applyDeliveryFeesOnlyOnce: 1,
									requireSpecificDeliveryFee: 1,
									payWhatYouWant: 1,
									standalone: 1
								}
							}
						);
						if (productDoc) {
							if (runtimeConfig.deliveryFees.mode !== 'perItem') {
								delete productDoc.deliveryFees;
							}
							return {
								product: productDoc,
								picture: await collections.pictures.findOne(
									{ productId: item.productId },
									{ sort: { createdAt: 1 } }
								),
								digitalFiles: await collections.digitalFiles
									.find({ productId: item.productId })
									.sort({ createdAt: 1 })
									.toArray(),
								quantity: item.quantity,
								...(item.customPrice && { customPrice: item.customPrice })
							};
						}
					})
			  ).then((res) => filterUndef(res))
			: null
	};
}
