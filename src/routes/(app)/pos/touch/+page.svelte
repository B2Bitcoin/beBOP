<script lang="ts">
	import { groupBy } from 'lodash-es';
	import type { SetRequired } from 'type-fest';
	import type { Picture } from '$lib/types/Picture';
	import ProductWidgetPOS from '$lib/components/ProductWidget/ProductWidgetPOS.svelte';
	import { isPreorder } from '$lib/types/Product';
	import { page } from '$app/stores';
	import { useI18n } from '$lib/i18n.js';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { computeDeliveryFees, computePriceInfo } from '$lib/types/Cart.js';
	import { UNDERLYING_CURRENCY } from '$lib/types/Currency.js';
	import { isAlpha2CountryCode } from '$lib/types/Country.js';

	export let data;
	$: picturesByProduct = groupBy(
		data.pictures.filter(
			(picture): picture is SetRequired<Picture, 'productId'> => !!picture.productId
		),
		'productId'
	);
	$: filter = $page.url.searchParams.get('filter') ?? 'pos-favorite';
	$: productFiltered =
		filter === 'all'
			? data.products
			: data.products.filter((product) => product.tagIds?.includes(filter));
	$: items = data.cart || [];
	$: deliveryFees =
		data.countryCode && isAlpha2CountryCode(data.countryCode)
			? computeDeliveryFees(UNDERLYING_CURRENCY, data.countryCode, items, data.deliveryFees)
			: NaN;
	$: priceInfo = computePriceInfo(items, {
		bebopCountry: data.vatCountry,
		vatSingleCountry: data.vatSingleCountry,
		vatNullOutsideSellerCountry: data.vatNullOutsideSellerCountry,
		vatExempted: data.vatExempted,
		userCountry: data.countryCode,
		deliveryFees: {
			amount: deliveryFees || 0,
			currency: UNDERLYING_CURRENCY
		},
		vatProfiles: data.vatProfiles
	});
	const { t } = useI18n();
</script>

<div class="grid grid-cols-3 gap-4">
	<div class=" touchScreen-ticket-menu p-3">
		{#if items.length}
			<h3 class="text-3xl">TICKET n° tmp</h3>
			{#each items as item, i}
				<div class="flex flex-col py-3 gap-4">
					<h3 class="text-2xl">{item.quantity} X {item.product.name.toUpperCase()}</h3>
					<div class="flex text-2xl flex-row items-end justify-end">
						{#if item.quantity > 1}{item.quantity}X
						{/if}
						<PriceTag
							amount={item.product.price.amount}
							currency={item.product.price.currency}
							class="text-2xl"
							main
						/>
					</div>
					{#if item.quantity > 1}
						<div class="text-2xl flex flex-row items-end justify-end">
							=<PriceTag
								amount={item.quantity * item.product.price.amount}
								currency={item.product.price.currency}
								class="text-2xl"
								main
							/>
						</div>
					{/if}
					<div class="text-2xl flex flex-row items-end justify-end">
						+<span class="font-semibold">{t('cart.vat')} {priceInfo.vatRates[i]}%</span>
					</div>
				</div>
			{/each}
			<div class="flex flex-col border-t border-gray-300 py-6">
				<h2 class="text-3xl">{t('cart.total').toUpperCase()} =</h2>
				<div class="flex flex-col items-end justify-end">
					<PriceTag
						amount={priceInfo.partialPriceWithVat}
						currency={priceInfo.currency}
						main
						class="text-2xl"
					/>
				</div>
				{#each priceInfo.vat as vat}
					<div class="flex flex-col">
						<h2 class="text-[28px]">Dont TVA</h2>
						<div class="text-2xl flex flex-row items-end justify-end">
							{vat.rate}% =
							<PriceTag
								amount={vat.partialPrice.amount}
								currency={vat.partialPrice.currency}
								main
								class="text-[28px]"
							/>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p>{t('cart.empty')}</p>
		{/if}
	</div>
	<div class="col-span-2">
		<div class="grid grid-cols-2 gap-4 text-3xl text-center">
			<a class="col-span-2 touchScreen-category-cta" href="?filter=pos-favorite">FAVORIS</a>
			<div class="touchScreen-category-cta">E-pub(salon FR)</div>
			<div class="touchScreen-category-cta">Livre audio CD(salon FR)</div>
			<div class="touchScreen-category-cta">Livre physique(salon FR)</div>
			<div class="touchScreen-category-cta">autres aricles(salon FR)</div>
			<a class="col-span-2 touchScreen-category-cta" href="?filter=all">TOUS LES ARTICLES</a>

			<div class="col-span-2 grid grid-cols-2 gap-4">
				{#each productFiltered as product}
					{#if !isPreorder(product.availableDate, product.preorder)}
						<ProductWidgetPOS {product} pictures={picturesByProduct[product._id]} />
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>

<div class="grid grid-cols-3 gap-4 mt-2">
	<div class="touchScreen-ticket-menu text-3xl p-4 text-center">TICKETS</div>
	<div class="col-span-2 grid grid-cols-3 gap-4">
		<div class="col-span-1 touchScreen-action-secondaryCTA text-3xl p-4">SAUVER</div>
		<div class="col-span-1 touchScreen-action-secondaryCTA text-3xl p-4">POOL</div>
		<div class="col-span-1 touchScreen-action-secondaryCTA text-3xl p-4">OUVRIR TIROIR</div>
	</div>
</div>
<div class="grid grid-cols-2 gap-4 mt-2">
	<div class="touchScreen-action-cta text-3xl p-4 text-center">PAYER</div>
	<div class="grid grid-cols-2 gap-4">
		<div class="col-span-1 touchScreen-action-cancel text-3xl p-4 text-center">❎</div>
		<div class="col-span-1 touchScreen-action-delete text-3xl p-4 text-center">🗑️</div>
	</div>
</div>
