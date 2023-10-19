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
	export const order = writable(null);
	export const view = writable('updateCart');

	function subscribeToServerEvents() {
		console.log('=> subscribeToServerEvents');

		fetchEventSource(`/sse?sessionId=${data.session.sessionId}`, {
			onmessage(ev) {
				const { eventType } = JSON.parse(ev.data);
				if (eventType === 'updateCart') {
					view.set('updateCart');
					fetchUpdatedCart();
				} else if (eventType === 'checkout') {
					view.set('checkout');
					fetchOrder();
				}
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

			cart.set(updatedCart);
		} else {
			console.error('Failed to fetch updated cart:', await response.text());
		}
	}

	async function fetchOrder() {
		const response = await fetch(`/session/order?sessionId=${data.session.sessionId}`);
		if (response.ok) {
			const orderData = await response.json();
			order.set(orderData);
		} else {
			console.error('Failed to fetch updated cart:', await response.text());
		}
	}

	console.log('ORDERRRR ', $order);

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
	{#if $view === 'updateCart'}
		{#if $cart.length}
			<div class="overflow-scroll h-[90vh]">
				{#each $cart as item}
					<div class="flex items-center justify-between w-full">
						<div class="flex flex-col">
							<h2 class="text-sm text-gray-850">{item.quantity} x {item.product.name}</h2>
							<div class="flex gap-2">
								<div class="w-[60px] h-[60px] rounded flex items-center">
									{#if item.picture}
										<Picture
											picture={item.picture}
											class="mx-auto rounded h-full object-contain"
											sizes="60px"
										/>
									{/if}
								</div>
							</div>
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
		{/if}
	{:else if $view === 'checkout'}
		{#if order}
			<div class="flex flex-col items-center gap-3">
				<h1 class="text-3xl text-center">Order #{$order?.number}</h1>
				<div class="w-32 h-32 bg-black block" />
			</div>
		{/if}
	{/if}

	<div class=" h-[10vh] flex justify-between p-2 gap-6 bg-gray-300 fixed left-0 right-0 bottom-0">
		<h2 class="text-gray-800 text-[32px]">Total:</h2>
		<div class="flex flex-col items-end">
			<PriceTag
				amount={$order?.totalPrice?.amount || totalPriceWithVat || 0}
				currency={$order?.totalPrice?.currency || data.currencies.main || 'EUR'}
				main
				class="text-[32px] text-gray-800"
			/>
			<PriceTag
				class="text-base text-gray-600"
				amount={$order?.totalPrice?.amount || totalPriceWithVat || 0}
				currency={$order?.totalPrice?.currency || data.currencies.main || 'EUR'}
				secondary
			/>
		</div>
	</div>
</main>
