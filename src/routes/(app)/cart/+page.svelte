<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import ProductType from '$lib/components/ProductType.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { useI18n } from '$lib/i18n';
	import { computeDeliveryFees } from '$lib/types/Cart.js';
	import type { CountryAlpha2 } from '$lib/types/Country.js';
	import { UNDERLYING_CURRENCY } from '$lib/types/Currency.js';
	import { oneMaxPerLine } from '$lib/types/Product.js';
	import { UrlDependency } from '$lib/types/UrlDependency.js';
	import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding.js';
	import { sumCurrency } from '$lib/utils/sumCurrency';

	export let data;

	let actionCount = 0;
	let country = data.countryCode as CountryAlpha2;

	let errorMessage = data.errorMessage;
	let errorProductId = '';
	$: deliveryFees = computeDeliveryFees(UNDERLYING_CURRENCY, country, items, data.deliveryFees);

	$: items = data.cart || [];
	$: totalPrice =
		sumCurrency(
			UNDERLYING_CURRENCY,
			items.map((item) => ({
				currency: (item.customPrice || item.product.price).currency,
				amount:
					((item.customPrice || item.product.price).amount *
						item.quantity *
						(item.depositPercentage ?? 100)) /
					100
			}))
		) + (deliveryFees || 0);

	$: vat = fixCurrencyRounding(totalPrice * (data.vatRate / 100), UNDERLYING_CURRENCY);
	$: totalPriceWithVat = totalPrice + vat;

	const { t, locale } = useI18n();
</script>

<main class="mx-auto max-w-7xl flex flex-col gap-2 px-6 py-10 body-mainPlan">
	<div class="w-full rounded-xl p-6 flex flex-col gap-6 body-mainPlan border-gray-300">
		<h1 class="page-title body-title">{t('cart.items')}</h1>

		{#if errorMessage && !errorProductId}
			<p class="text-red-600">{errorMessage}</p>
		{/if}

		{#if items.length}
			<div
				class="grid gap-x-4 gap-y-6 overflow-hidden"
				style="grid-template-columns: auto 1fr auto auto"
			>
				{#each items as item}
					{@const price = item.customPrice || item.product.price}
					<form
						method="POST"
						class="contents"
						use:enhance={({ action }) => {
							errorMessage = '';

							if (action.searchParams.has('/increase')) {
								item.quantity++;
							} else if (action.searchParams.has('/decrease')) {
								item.quantity--;
							} else if (action.searchParams.has('/remove')) {
								item.quantity = 0;
							}
							actionCount++;
							let currentActionCount = actionCount;

							return async ({ result }) => {
								if (actionCount === currentActionCount) {
									if (result.type === 'redirect') {
										// Invalidate all to remove 0-quantity items
										await goto(result.location, { noScroll: true, invalidateAll: true });
										return;
									}
									if (result.type === 'error' && result.error?.message) {
										errorMessage = result.error.message;
										errorProductId = item.product._id;
										await invalidate(UrlDependency.Cart);
										return;
									}
									await applyAction(result);
								}
							};
						}}
					>
						<a
							href="/product/{item.product._id}"
							class="w-[138px] h-[138px] min-w-[138px] min-h-[138px] rounded flex items-center"
						>
							{#if item.picture}
								<Picture
									picture={item.picture}
									class="mx-auto rounded h-full object-contain"
									sizes="138px"
								/>
							{/if}
						</a>
						<div class="flex flex-col gap-2">
							<a href="/product/{item.product._id}">
								<h2 class="text-2xl">{item.product.name}</h2>
							</a>
							<p class="text-sm">{item.product.shortDescription}</p>
							<div class="grow" />
							<div class="flex flex-row gap-2">
								<ProductType
									product={item.product}
									depositPercentage={item.depositPercentage}
									hasDigitalFiles={item.digitalFiles.length >= 1}
								/>
							</div>
							<button
								formaction="/cart/{item.product._id}/?/remove"
								class="mt-auto mr-auto hover:underline body-hyperlink text-base font-light"
							>
								{t('cart.cta.discardItem')}
							</button>
						</div>

						<div class="self-center">
							{#if !oneMaxPerLine(item.product)}
								<CartQuantity {item} />
							{/if}
						</div>

						<div class="flex flex-col items-end justify-center">
							<PriceTag
								amount={(item.quantity * price.amount * (item.depositPercentage ?? 100)) / 100}
								currency={price.currency}
								main
								class="text-2xl truncate"
								>{item.depositPercentage
									? `(${(item.depositPercentage / 100).toLocaleString($locale, {
											style: 'percent'
									  })})`
									: ''}</PriceTag
							>
							<PriceTag
								class="text-base truncate"
								amount={(item.quantity * price.amount * (item.depositPercentage ?? 100)) / 100}
								currency={price.currency}
								secondary
							/>
							<span class="font-semibold">{t('product.vatExcluded')}</span>
						</div>
					</form>

					{#if errorMessage && errorProductId === item.product._id}
						<p class="text-red-600 col-span-4">{errorMessage}</p>
					{/if}

					<div class="border-b border-gray-300 col-span-4" />
				{/each}
			</div>
			{#if deliveryFees}
				<div class="flex justify-end border-b border-gray-300 pb-6 gap-6">
					<div class="flex flex-col">
						<h3 class="text-base">{t('checkout.deliveryFees')}</h3>
					</div>
					<div class="flex flex-col items-end">
						<PriceTag
							class="text-2xl truncate"
							amount={deliveryFees}
							currency={UNDERLYING_CURRENCY}
							main
						/>
						<PriceTag
							amount={deliveryFees}
							currency={UNDERLYING_CURRENCY}
							class="text-base truncate"
							secondary
						/>
					</div>
				</div>
			{:else if isNaN(deliveryFees)}
				<div class="alert-error mt-3">
					{t('checkout.noDeliveryInCountry')}
				</div>
			{/if}
			{#if data.vatCountry && !data.vatExempted}
				<div class="flex justify-end border-b border-gray-300 pb-6 gap-6">
					<div class="flex flex-col">
						<h2 class="text-[28px]">{t('cart.vat')} ({data.vatRate}%):</h2>
						<p class="text-sm">
							{t('cart.vatRate', { country: data.vatCountry })}.
							{#if data.vatSingleCountry}
								{t('cart.vatSellerCountry')}
							{:else}
								<Trans key="cart.vatIpCountry">
									<a href="https://lite.ip2location.com" slot="0"> https://lite.ip2location.com </a>
								</Trans>
							{/if}
						</p>
					</div>
					<div class="flex flex-col items-end">
						<PriceTag amount={vat} currency={UNDERLYING_CURRENCY} main class="text-[28px]" />
						<PriceTag class="text-base" amount={vat} currency={UNDERLYING_CURRENCY} secondary />
					</div>
				</div>
			{/if}
			<div class="flex justify-end border-b border-gray-300 pb-6 gap-6">
				<h2 class="text-[32px]">{t('cart.total')}:</h2>
				<div class="flex flex-col items-end">
					<PriceTag
						amount={totalPriceWithVat}
						currency={UNDERLYING_CURRENCY}
						main
						class="text-[32px]"
					/>
					<PriceTag
						class="text-base"
						amount={totalPriceWithVat}
						currency={UNDERLYING_CURRENCY}
						secondary
					/>
				</div>
			</div>
			<div class="flex justify-end">
				<a href="/checkout" class="btn body-cta body-mainCTA">{t('cart.cta.checkout')}</a>
			</div>
		{:else}
			<p>{t('cart.empty')}</p>
		{/if}
	</div>
</main>
