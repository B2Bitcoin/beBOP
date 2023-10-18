<script lang="ts">
	import { fetchEventSource } from '@microsoft/fetch-event-source';
	import { writable } from 'svelte/store';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import ProductType from '$lib/components/ProductType.svelte';
	import CartQuantity from '$lib/components/CartQuantity.svelte';
	import { oneMaxPerLine } from '$lib/types/Product.js';
	import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding.js';
	import { sumCurrency } from '$lib/utils/sumCurrency';

	export let data;

	export const cart = writable(data.cart);

	console.log('coucou', $cart);

	function subscribeToServerEvents() {
		console.log('=> subscribeToServerEvents');

		fetchEventSource('/sse', {
			onmessage(ev) {
				console.log('=> message ');
				fetchUpdatedCart();
			},
			onopen() {
				console.log('=> Connection established');
			},
			onerror(err) {
				console.error('=> SSE Error:', err);
			}
		});
	}

	async function fetchUpdatedCart() {
		const response = await fetch(`/session/cart?sessionId=${data.session.sessionId}`);
		if (response.ok) {
			const updatedCart = await response.json();
			console.log('updatedCart ', updatedCart);

			cart.set(updatedCart);
		} else {
			console.error('Failed to fetch updated cart:', await response.text());
		}
	}

	subscribeToServerEvents();

	$: totalPrice = sumCurrency(
		data.currencies.main,
		$cart.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount: (item.customPrice || item.product.price).amount * item.quantity
		}))
	);
	$: vat = fixCurrencyRounding(totalPrice * (data.vatRate / 100), data.currencies.main);
	$: totalPriceWithVat = totalPrice + vat;
</script>

<main class="fixed top-0 bottom-0 right-0 left-0 bg-white p-4">
	<div class="">
		{#if $cart.length}
			<div class="overflow-hidden">
				{#each $cart as item}
					<div class="flex items-center justify-between w-full">
						<div class="flex flex-col">
							<h2 class="text-2xl text-gray-850">{item.product.name}</h2>
							<div class="flex gap-2">
								<div
									class="w-[138px] h-[138px] min-w-[138px] min-h-[138px] rounded flex items-center"
								>
									{#if item.picture}
										<Picture
											picture={item.picture}
											class="mx-auto rounded h-full object-contain"
											sizes="138px"
										/>
									{/if}
								</div>
								<div class="flex items-start gap-2">
									<ProductType
										product={item.product}
										hasDigitalFiles={item.digitalFiles.length >= 1}
									/>
								</div>
							</div>
						</div>

						<div>
							Quantity : {item.quantity}
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
					</div>

					<div class="border-b border-gray-300 col-span-4" />
				{/each}
			</div>

			<div class="flex justify-end pb-6 gap-6">
				<h2 class="text-gray-800 text-[32px]">Total:</h2>
				<div class="flex flex-col items-end">
					<PriceTag
						amount={totalPriceWithVat}
						currency={data.currencies.main}
						main
						class="text-[32px] text-gray-800"
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={totalPriceWithVat}
						currency={data.currencies.main}
						secondary
					/>
				</div>
			</div>
		{:else}
			<p>Cart is empty</p>
		{/if}
	</div>
</main>
