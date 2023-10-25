<script lang="ts">
	import { fetchEventSource } from '@microsoft/fetch-event-source';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding.js';
	import { sumCurrency } from '$lib/utils/sumCurrency';
	import CheckCircleOutlined from '~icons/ant-design/check-circle-outlined';
	import { onMount } from 'svelte';

	interface CustomEventSource {
		onerror?: ((this: CustomEventSource, ev: Event) => unknown) | null;
		onmessage?: ((this: CustomEventSource, ev: MessageEvent) => unknown) | null;
		close?: () => void;
	}

	let eventSourceInstance: CustomEventSource | void | null = null;
	export let data;
	let cart = data.cart;
	let order = data.order;

	$: view = cart && cart.length > 0 ? 'updateCart' : order ? order.payment.status : 'welcome';

	setTimeout(() => {
		if (order === data.order && order?.payment.status !== 'pending') {
			order = null;
		}
	}, 5_000);

	async function subscribeToServerEvents() {
		eventSourceInstance = await fetchEventSource(`/pos/session/sse`, {
			onmessage(ev) {
				console.log('event', ev.data, ev.data?.length);
				if (ev.data) {
					try {
						const { eventType, cart: sseCart, order: sseOrder } = JSON.parse(ev.data);
						if (eventType === 'cart') {
							cart = sseCart;
						} else if (eventType === 'order') {
							order = sseOrder;
							setTimeout(() => {
								if (order === sseOrder && order?.payment.status !== 'pending') {
									order = null;
								}
							}, 5_000);
						}
					} catch (err) {
						console.error('=> SSE Error:', err);
					}
				}
			},
			onerror(err) {
				console.error('=> SSE Error:', err);
			}
			// Can set to true if you want tab to update even when hidden
			// openWhenHidden: true
		});
	}

	function cleanUpServerEvents() {
		if (eventSourceInstance) {
			eventSourceInstance?.close?.();
			eventSourceInstance = null;
		}
	}

	onMount(() => {
		subscribeToServerEvents();

		return () => {
			cleanUpServerEvents();
		};
	});

	$: totalPrice = sumCurrency(
		data.currencies.main,
		cart.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount: (item.customPrice || item.product.price).amount * item.quantity
		}))
	);
	$: vat = fixCurrencyRounding(totalPrice * (data.vatRate / 100), data.currencies.main);
	$: totalPriceWithVat = totalPrice + vat;
</script>

<main class="fixed top-0 bottom-0 right-0 left-0 bg-white p-4">
	{#if view === 'updateCart'}
		{#if cart.length}
			<div class="overflow-auto h-[90vh]">
				{#each cart as item}
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
	{:else if view === 'pending'}
		{#if order?.payment?.method === 'cash'}
			<div class="text-2xl text-center">Waiting confirmation</div>
		{:else}
			<div class="flex flex-col items-center gap-3">
				<h1 class="text-3xl text-center">Order #{order?.number}</h1>
				<img src="/order/{order?._id}/qrcode" alt="QR code" />
			</div>
		{/if}
	{:else if view === 'canceled'}
		<div class="text-2xl text-center">Order cancelled</div>
	{:else if view === 'expired'}
		<div class="text-2xl text-center">Order expired</div>
	{:else if view === 'paid'}
		<div class="flex flex-col items-center gap-3">
			<h1 class="text-3xl text-center">Order #{order?.number}</h1>
			<CheckCircleOutlined font-size="160" />
		</div>
	{:else if view === 'welcome'}
		<div class="flex flex-col items-center">
			<h1 class="text-3xl">Welcome</h1>
			<Picture class="" picture={data.logoPicture || undefined} />
			<h2 class="text-2xl">We're happy to see you</h2>
		</div>
	{/if}

	{#if (order || cart) && view !== 'welcome'}
		<div class="flex justify-between flex-col p-2 gap-2 bg-gray-300 fixed left-0 right-0 bottom-0">
			{#if data.vatCountry && !data.vatExempted}
				<div class="flex justify-end border-b border-gray-300 gap-6">
					<div class="flex flex-col">
						<h2 class="text-gray-800 text-[28px]">Vat ({data.vatRate}%):</h2>
						<p class="text-sm text-gray-600">
							VAT rate for {data.vatCountry}.
							{#if data.vatSingleCountry}
								The country is the seller's country.
							{:else}
								The country is determined through data from
								<a href="https://lite.ip2location.com"> https://lite.ip2location.com </a>
							{/if}
						</p>
					</div>
					<div class="flex flex-col items-end">
						<PriceTag
							amount={view === 'pending' ? order?.vat?.price?.amount || 0 : vat}
							currency={view === 'pending'
								? order?.vat?.price?.currency || 'USD'
								: data.currencies.main}
							main
							class="text-[28px] text-gray-800"
						/>
						<PriceTag
							class="text-base text-gray-600"
							amount={view === 'pending' ? order?.vat?.price?.amount || 0 : vat}
							currency={view === 'pending'
								? order?.vat?.price?.currency || 'USD'
								: data.currencies.main}
							secondary
						/>
					</div>
				</div>
			{/if}

			<div class="flex justify-between">
				<h2 class="text-gray-800 text-[32px]">Total:</h2>
				<div class="flex flex-col items-end">
					<PriceTag
						amount={view === 'pending' ? order?.totalPrice?.amount || 0 : totalPriceWithVat}
						currency={view === 'pending'
							? order?.totalPrice?.currency || 'USD'
							: data.currencies.main}
						main
						class="text-[32px] text-gray-800"
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={view === 'pending' ? order?.totalPrice?.amount || 0 : totalPriceWithVat}
						currency={view === 'pending'
							? order?.totalPrice?.currency || 'USD'
							: data.currencies.main}
						secondary
					/>
				</div>
			</div>
		</div>
	{/if}
</main>
