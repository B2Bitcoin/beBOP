import { adminPrefix } from '$lib/server/admin.js';
import { getCartFromDb } from '$lib/server/cart.js';
import { collections } from '$lib/server/database';
import { runtimeConfig } from '$lib/server/runtime-config';
import { userIdentifier } from '$lib/server/user.js';
import { locales } from '$lib/translations/index.js';
import { vatRate } from '$lib/types/Country.js';
import type { Product } from '$lib/types/Product';
import { UrlDependency } from '$lib/types/UrlDependency';
import { filterUndef } from '$lib/utils/filterUndef';
import { error, redirect } from '@sveltejs/kit';

export async function load(params) {
	if (!runtimeConfig.isAdminCreated) {
		if (params.locals.user) {
			throw error(
				400,
				"Admin account hasn't been created yet. Please open a new private window to create admin account"
			);
		}
		if (params.url.pathname !== `${adminPrefix()}/login`) {
			throw redirect(302, `${adminPrefix()}/login`);
		}
	}

	const { depends, locals } = params;

	depends(UrlDependency.Cart);

	const cart = await getCartFromDb({ user: userIdentifier(locals) });
	const logoPicture = runtimeConfig.logo.pictureId
		? (await collections.pictures.findOne({ _id: runtimeConfig.logo.pictureId })) || undefined
		: undefined;
	const logoPictureDark = runtimeConfig.logo.darkModePictureId
		? (await collections.pictures.findOne({ _id: runtimeConfig.logo.darkModePictureId })) ||
		  logoPicture
		: logoPicture;
	const footerPicture = runtimeConfig.footerLogoId
		? (await collections.pictures.findOne({ _id: runtimeConfig.footerLogoId })) || undefined
		: undefined;
	return {
		isMaintenance: runtimeConfig.isMaintenance,
		vatExempted: runtimeConfig.vatExempted,
		exchangeRate: runtimeConfig.exchangeRate,
		countryCode: locals.countryCode,
		email: locals.email || locals.sso?.find((sso) => sso.email)?.email,
		roleId: locals.user?.roleId,
		emailFromSso: !locals.email && locals.sso?.some((sso) => sso.email),
		npub: locals.npub,
		sso: locals.sso,
		userId: locals.user?._id.toString(),
		vatRate:
			runtimeConfig.vatCountry !== locals.countryCode && runtimeConfig.vatNullOutsideSellerCountry
				? vatRate(runtimeConfig.vatCountry)
				: runtimeConfig.vatExempted
				? 0
				: runtimeConfig.vatSingleCountry
				? vatRate(runtimeConfig.vatCountry)
				: vatRate(locals.countryCode ?? runtimeConfig.vatCountry),
		vatSingleCountry: runtimeConfig.vatSingleCountry,
		vatCountry: runtimeConfig.vatSingleCountry
			? runtimeConfig.vatCountry
			: locals.countryCode ?? runtimeConfig.vatCountry,
		vatNullOutsideSellerCountry: runtimeConfig.vatNullOutsideSellerCountry,
		currencies: {
			main: runtimeConfig.mainCurrency,
			secondary: runtimeConfig.secondaryCurrency,
			priceReference: runtimeConfig.priceReferenceCurrency
		},
		brandName:
			runtimeConfig[`translations.${locals.language}.config`]?.brandName || runtimeConfig.brandName,
		locales,
		logoPicture,
		logoPictureDark,
		logo: runtimeConfig.logo,
		footerLogoId: runtimeConfig.footerLogoId,
		footerPicture,
		usersDarkDefaultTheme: runtimeConfig.usersDarkDefaultTheme,
		employeesDarkefaulTheme: runtimeConfig.employeesDarkDefaultTheme,
		displayPoweredBy: runtimeConfig.displayPoweredBy,
		displayCompanyInfo: runtimeConfig.displayCompanyInfo,
		links: {
			footer:
				runtimeConfig[`translations.${locals.language}.config`]?.footerLinks ??
				runtimeConfig.footerLinks,
			navbar:
				runtimeConfig[`translations.${locals.language}.config`]?.navbarLinks ??
				runtimeConfig.navbarLinks,
			topbar:
				runtimeConfig[`translations.${locals.language}.config`]?.topbarLinks ??
				runtimeConfig.topbarLinks
		},
		sellerIdentity: runtimeConfig.sellerIdentity,
		deliveryFees: runtimeConfig.deliveryFees,
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
								| 'maxQuantityPerOrder'
								| 'stock'
							>
						>(
							{ _id: item.productId },
							{
								projection: {
									_id: 1,
									name: { $ifNull: [`$translations.${locals.language}.name`, '$name'] },
									price: 1,
									shortDescription: {
										$ifNull: [
											`$translations.${locals.language}.shortDescription`,
											'$shortDescription'
										]
									},
									type: 1,
									shipping: 1,
									availableDate: 1,
									preorder: 1,
									deliveryFees: 1,
									applyDeliveryFeesOnlyOnce: 1,
									requireSpecificDeliveryFee: 1,
									payWhatYouWant: 1,
									standalone: 1,
									maxQuantityPerOrder: 1,
									stock: 1
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
								...(item.customPrice && { customPrice: item.customPrice }),
								depositPercentage: item.depositPercentage
							};
						}
					})
			  ).then((res) => filterUndef(res))
			: null,
		confirmationBlocksThresholds: runtimeConfig.confirmationBlocksThresholds
	};
}
