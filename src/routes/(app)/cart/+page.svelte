<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import ProductType from '$lib/components/ProductType.svelte';
	import Trans from '$lib/components/Trans.svelte';
	import { useI18n } from '$lib/i18n';
	import { UNDERLYING_CURRENCY } from '$lib/types/Currency.js';
	import { oneMaxPerLine } from '$lib/types/Product.js';
	import { UrlDependency } from '$lib/types/UrlDependency.js';
	import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding.js';
	import { sumCurrency } from '$lib/utils/sumCurrency';

	export let data;

	let actionCount = 0;

	let errorMessage = data.errorMessage;
	let errorProductId = '';

	$: items = data.cart || [];
	$: totalPrice = sumCurrency(
		UNDERLYING_CURRENCY,
		items.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount: (item.customPrice || item.product.price).amount * item.quantity
		}))
	);
	$: vat = fixCurrencyRounding(totalPrice * (data.vatRate / 100), UNDERLYING_CURRENCY);
	$: totalPriceWithVat = totalPrice + vat;

	const { t } = useI18n();
</script>

<main class="mx-auto max-w-7xl flex flex-col gap-2 px-6 py-10">
	<div class="w-full rounded-xl p-6 flex flex-col gap-6 body-secondPlan border-gray-300 border">
		<h1 class="page-title">{t('cart.items')}</h1>

		{#if errorMessage && !errorProductId}
			<p class="text-red-600">{errorMessage}</p>
		{/if}

		{#if items.length}
			<div
				class="grid gap-x-4 gap-y-6 overflow-hidden"
				style="grid-template-columns: auto 1fr auto auto"
			>
				{#each items as item}
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
								<h2 class="text-2xl text-gray-850">{item.product.name}</h2>
							</a>
							<p class="text-sm text-gray-600">{item.product.shortDescription}</p>
							<div class="grow" />
							<div class="flex flex-row gap-2">
								<ProductType
									product={item.product}
									hasDigitalFiles={item.digitalFiles.length >= 1}
								/>
							</div>
							<button
								formaction="/cart/{item.product._id}/?/remove"
								class="mt-auto mr-auto hover:underline text-link text-base font-light"
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
							{#if item.product.type !== 'subscription' && item.customPrice}
								<PriceTag
									amount={item.quantity * item.customPrice.amount}
									currency={item.customPrice.currency}
									main
									class="text-2xl text-gray-800 truncate"
								/>
								<PriceTag
									class="text-base text-gray-600 truncate"
									amount={item.quantity * item.customPrice.amount}
									currency={item.customPrice.currency}
									secondary
								/>
							{:else}
								<PriceTag
									amount={item.quantity * item.product.price.amount}
									currency={item.product.price.currency}
									main
									class="text-2xl text-gray-800 truncate"
								/>
								<PriceTag
									class="text-base text-gray-600 truncate"
									amount={item.quantity * item.product.price.amount}
									currency={item.product.price.currency}
									secondary
								/>
							{/if}
						</div>
					</form>

					{#if errorMessage && errorProductId === item.product._id}
						<p class="text-red-600 col-span-4">{errorMessage}</p>
					{/if}

					<div class="border-b border-gray-300 col-span-4" />
				{/each}
			</div>
			{#if data.vatCountry && !data.vatExempted}
				<div class="flex justify-end border-b border-gray-300 pb-6 gap-6">
					<div class="flex flex-col">
						<h2 class="text-gray-800 text-[28px]">{t('cart.vat')} ({data.vatRate}%):</h2>
						<p class="text-sm text-gray-600">
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
						<PriceTag
							amount={vat}
							currency={UNDERLYING_CURRENCY}
							main
							class="text-[28px] text-gray-800"
						/>
						<PriceTag
							class="text-base text-gray-600"
							amount={vat}
							currency={UNDERLYING_CURRENCY}
							secondary
						/>
					</div>
				</div>
			{/if}
			<div class="flex justify-end border-b border-gray-300 pb-6 gap-6">
				<h2 class="text-gray-800 text-[32px]">{t('cart.total')}:</h2>
				<div class="flex flex-col items-end">
					<PriceTag
						amount={totalPriceWithVat}
						currency={UNDERLYING_CURRENCY}
						main
						class="text-[32px] text-gray-800"
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={totalPriceWithVat}
						currency={UNDERLYING_CURRENCY}
						secondary
					/>
				</div>
			</div>
			<div class="flex justify-end">
				<a href="/checkout" class="btn btn-black w-80">{t('cart.cta.checkout')}</a>
			</div>
		{:else}
			<p>{t('cart.empty')}</p>
		{/if}
	</div>
</main>
