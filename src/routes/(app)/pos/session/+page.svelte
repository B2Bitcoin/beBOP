<script lang="ts">
	import { fetchEventSource } from '@microsoft/fetch-event-source';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { fixCurrencyRounding } from '$lib/utils/fixCurrencyRounding.js';
	import { sumCurrency } from '$lib/utils/sumCurrency';
	import CheckCircleOutlined from '~icons/ant-design/check-circle-outlined';
	import { onMount } from 'svelte';
	import { UNDERLYING_CURRENCY } from '$lib/types/Currency.js';
	import { useI18n } from '$lib/i18n';
	import Trans from '$lib/components/Trans.svelte';

	interface CustomEventSource {
		onerror?: ((this: CustomEventSource, ev: Event) => unknown) | null;
		onmessage?: ((this: CustomEventSource, ev: MessageEvent) => unknown) | null;
		close?: () => void;
	}

	let eventSourceInstance: CustomEventSource | void | null = null;
	export let data;
	let cart = data.cart;
	let order = data.order;

	$: view = cart && cart.length > 0 ? 'updateCart' : order ? order.status : 'welcome';

	setTimeout(() => {
		if (order === data.order && order?.status !== 'pending') {
			order = null;
		}
	}, 5_000);

	async function subscribeToServerEvents() {
		eventSourceInstance = await fetchEventSource(`/pos/session/sse`, {
			onmessage(ev) {
				if (ev.data) {
					try {
						const { eventType, cart: sseCart, order: sseOrder } = JSON.parse(ev.data);
						if (eventType === 'cart') {
							cart = sseCart;
						} else if (eventType === 'order') {
							order = sseOrder;
							setTimeout(() => {
								if (order === sseOrder && order?.status !== 'pending') {
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
		UNDERLYING_CURRENCY,
		cart.map((item) => ({
			currency: (item.customPrice || item.product.price).currency,
			amount: (item.customPrice || item.product.price).amount * item.quantity
		}))
	);
	$: vat = fixCurrencyRounding(totalPrice * (data.vatRate / 100), UNDERLYING_CURRENCY);
	$: totalPriceWithVat = totalPrice + vat;

	const { t } = useI18n();
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
		{#if order?.payments[0]?.method === 'point-of-sale'}
			<div class="text-2xl text-center">{t('pos.session.waitingPaymentConfirmation')}</div>
		{:else}
			<div class="flex flex-col items-center gap-3">
				<h1 class="text-3xl text-center">{t('order.singleTitle', { number: order?.number })}</h1>
				<img src="/order/{order?._id}/payments/${order?.payments[0]?.id}/qrcode" alt="QR code" />
			</div>
		{/if}
	{:else if view === 'canceled'}
		<div class="text-2xl text-center">{t('order.paymentStatus.canceledTemplate')}</div>
	{:else if view === 'expired'}
		<div class="text-2xl text-center">{t('order.paymentStatus.expiredTemplate')}</div>
	{:else if view === 'paid'}
		<div class="flex flex-col items-center gap-3">
			<h1 class="text-3xl text-center">{t('order.singleTitle', { number: order?.number })}</h1>
			<CheckCircleOutlined font-size="160" />
		</div>
	{:else if view === 'welcome'}
		<div class="flex flex-col items-center">
			<h1 class="text-3xl">{t('pos.session.welcomeTitle')}</h1>
			<Picture class="" picture={data.logoPicture || undefined} />
			<h2 class="text-2xl">{t('pos.session.welcomeMessage')}</h2>
		</div>
	{/if}

	{#if (order || cart) && view !== 'welcome'}
		<div class="flex justify-between flex-col p-2 gap-2 bg-gray-300 fixed left-0 right-0 bottom-0">
			{#if data.vatCountry && !data.vatExempted}
				<div class="flex justify-end border-b border-gray-300 gap-6">
					<div class="flex flex-col">
						<h2 class="text-gray-800 text-[28px]">Vat ({data.vatRate}%):</h2>
						<p class="text-sm text-gray-600">
							{(t('cart.vatRate'), { country: data.vatCountry })}.
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
							amount={view === 'pending' ? order?.vat?.price?.amount || 0 : vat}
							currency={UNDERLYING_CURRENCY}
							main
							class="text-[28px] text-gray-800"
						/>
						<PriceTag
							class="text-base text-gray-600"
							amount={view === 'pending' ? order?.vat?.price?.amount || 0 : vat}
							currency={UNDERLYING_CURRENCY}
							secondary
						/>
					</div>
				</div>
			{/if}

			<div class="flex justify-between">
				<h2 class="text-gray-800 text-[32px]">{t('cart.total')}:</h2>
				<div class="flex flex-col items-end">
					<PriceTag
						amount={view === 'pending' ? order?.totalPrice?.amount || 0 : totalPriceWithVat}
						currency={UNDERLYING_CURRENCY}
						main
						class="text-[32px] text-gray-800"
					/>
					<PriceTag
						class="text-base text-gray-600"
						amount={view === 'pending' ? order?.totalPrice?.amount || 0 : totalPriceWithVat}
						currency={UNDERLYING_CURRENCY}
						secondary
					/>
				</div>
			</div>
		</div>
	{/if}
</main>
