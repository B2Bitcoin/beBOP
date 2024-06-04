import { ORIGIN } from '$env/static/private';
import { adminPrefix } from '$lib/server/admin.js';
import { getCartFromDb } from '$lib/server/cart.js';
import { collections } from '$lib/server/database';
import { pojo } from '$lib/server/pojo.js';
import { runtimeConfig } from '$lib/server/runtime-config';
import { userIdentifier } from '$lib/server/user.js';
import { locales } from '$lib/translations/index.js';
import type { Product } from '$lib/types/Product';
import { UrlDependency } from '$lib/types/UrlDependency';
import type { VatProfile } from '$lib/types/VatProfile.js';
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

	const [cart, logoPicture] = await Promise.all([
		getCartFromDb({ user: userIdentifier(locals) }),
		runtimeConfig.logo.pictureId
			? (await collections.pictures.findOne({ _id: runtimeConfig.logo.pictureId })) || undefined
			: undefined
	]);

	const [logoPictureDark, footerPicture, vatProfiles, cartData] = await Promise.all([
		runtimeConfig.logo.darkModePictureId
			? (await collections.pictures.findOne({ _id: runtimeConfig.logo.darkModePictureId })) ||
			  logoPicture
			: logoPicture,
		runtimeConfig.footerLogoId
			? (await collections.pictures.findOne({ _id: runtimeConfig.footerLogoId })) || undefined
			: undefined,
		await collections.vatProfiles
			.find({})
			.project<Pick<VatProfile, '_id' | 'name' | 'rates'>>({ _id: 1, name: 1, rates: 1 })
			.map((p) => ({ _id: p._id.toString(), name: p.name, rates: p.rates }))
			.toArray(),
		cart
			? await Promise.all(
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
								| 'isTicket'
								| 'vatProfileId'
								| 'paymentMethods'
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
									stock: 1,
									vatProfileId: 1,
									paymentMethods: 1,
									isTicket: 1
								}
							}
						);
						if (productDoc) {
							if (runtimeConfig.deliveryFees.mode !== 'perItem') {
								delete productDoc.deliveryFees;
							}
							return {
								product: pojo(productDoc),
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
			: null
	]);

	return {
		isMaintenance: runtimeConfig.isMaintenance,
		vatExempted: runtimeConfig.vatExempted,
		exchangeRate: runtimeConfig.exchangeRate,
		countryCode: locals.countryCode,
		vatProfiles,
		email: locals.email || locals.sso?.find((sso) => sso.email)?.email,
		roleId: locals.user?.roleId,
		emailFromSso: !locals.email && locals.sso?.some((sso) => sso.email),
		npub: locals.npub,
		sso: locals.sso,
		userId: locals.user?._id.toString(),
		vatSingleCountry: runtimeConfig.vatSingleCountry,
		vatCountry: runtimeConfig.vatCountry,
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
		displayMainShopInfo: runtimeConfig.displayMainShopInfo,
		viewportContentWidth: runtimeConfig.viewportContentWidth,
		viewportFor: runtimeConfig.viewportFor,
		links: {
			footer:
				runtimeConfig[`translations.${locals.language}.config`]?.footerLinks ??
				runtimeConfig.footerLinks,
			navbar:
				runtimeConfig[`translations.${locals.language}.config`]?.navbarLinks ??
				runtimeConfig.navbarLinks,
			topbar:
				runtimeConfig[`translations.${locals.language}.config`]?.topbarLinks ??
				runtimeConfig.topbarLinks,
			socialNetworkIcons: runtimeConfig.socialNetworkIcons
		},
		sellerIdentity: runtimeConfig.sellerIdentity,
		shopInformation: runtimeConfig.shopInformation,
		deliveryFees: runtimeConfig.deliveryFees,
		websiteLink: ORIGIN,
		cart: cartData,
		confirmationBlocksThresholds: runtimeConfig.confirmationBlocksThresholds,
		cartMaxSeparateItems: runtimeConfig.cartMaxSeparateItems,
		disableLanguageSelector: runtimeConfig.disableLanguageSelector,
		hideCmsZonesOnMobile: runtimeConfig.hideCmsZonesOnMobile
	};
}
