<script lang="ts">
	import type { SimplifiedOrder } from '$lib/types/Order';
	import PriceTag from './PriceTag.svelte';
	import IconBitcoin from './icons/IconBitcoin.svelte';
	import { currencies } from '$lib/stores/currencies';
	import { useI18n } from '$lib/i18n';

	export let orders:
		| Pick<
				SimplifiedOrder,
				'_id' | 'payment' | 'totalPrice' | 'number' | 'createdAt' | 'totalReceived'
		  >[]
		| [];
	export let adminPrefix: string | undefined = undefined;

	const { t, locale } = useI18n();
</script>

<ul class="flex flex-col gap-4">
	{#each orders as order}
		<li class="text-lg flex flex-wrap items-center gap-1">
			<a href="/order/{order._id}" class="text-link hover:underline">
				#{order.number.toLocaleString($locale)}
			</a>
			- {#if order.payment.method === 'bitcoin'}
				<IconBitcoin />
			{:else if order.payment.method === 'lightning'}
				⚡
			{:else if order.payment.method === 'cash'}
				💶
			{:else if order.payment.method === 'card'}
				💳
			{/if} -
			<time datetime={order.createdAt.toJSON()} title={order.createdAt.toLocaleString($locale)}
				>{order.createdAt.toLocaleDateString($locale)}</time
			>
			- <PriceTag currency={order.totalPrice.currency} amount={order.totalPrice.amount} />
			{#if adminPrefix}(<PriceTag
					currency={order.totalPrice.currency}
					amount={order.totalPrice.amount}
					convertedTo={$currencies.priceReference}
				/>){/if} -
			<span
				class={order.payment.status === 'expired' || order.payment.status === 'canceled'
					? 'text-gray-550'
					: order.payment.status === 'paid'
					? 'text-green-500'
					: ''}
			>
				{t('order.paymentStatus.' + order.payment.status)}</span
			>
			{#if order.totalReceived && adminPrefix}
				- {t('pos.order.satReceived')}
				<PriceTag
					inline
					currency={order.totalReceived.currency}
					amount={order.totalReceived.amount}
				/>
			{/if}
			{#if adminPrefix}
				{#if order.payment.status === 'pending' && order.payment.method === 'cash'}
					<form action="{adminPrefix}/order/{order._id}?/confirm" method="post">
						<button type="submit" class="btn btn-black">Mark paid</button>
					</form>
					<form action="{adminPrefix}/order/{order._id}?/cancel" method="post">
						<button type="submit" class="btn btn-red">Cancel</button>
					</form>
				{/if}
			{/if}
		</li>
	{:else}
		<li>No orders yet</li>
	{/each}
</ul>
