<script lang="ts">
	import { toSatoshis } from '$lib/utils/toSatoshis';
	import { formatDistance } from 'date-fns';
	import type { SimplifiedOrder } from '$lib/types/Order';
	import PriceTag from './PriceTag.svelte';
	import IconBitcoin from './icons/IconBitcoin.svelte';
	import type { Currency } from '$lib/types/Currency';

	export let orders:
		| Pick<
				SimplifiedOrder,
				'_id' | 'payment' | 'totalPrice' | 'number' | 'createdAt' | 'totalReceived'
		  >[]
		| [];
	export let priceReference: Currency | undefined = undefined;
	export let showForms: boolean;
	export let adminPrefix: string;
</script>

<ul class="flex flex-col gap-4">
	{#each orders as order}
		<li class="text-lg flex flex-wrap items-center gap-1">
			<a href="/order/{order._id}" class="text-link hover:underline">#{order.number}</a>
			- {#if order.payment.method === 'bitcoin'}
				<IconBitcoin />
			{:else if order.payment.method === 'lightning'}
				⚡
			{:else if order.payment.method === 'cash'}
				💶
			{:else if order.payment.method === 'card'}
				💳
			{/if} -
			<time datetime={order.createdAt.toJSON()} title={order.createdAt.toLocaleString('en')}
				>{formatDistance(order.createdAt, Date.now(), {
					addSuffix: true
				})}</time
			>
			- Total: {toSatoshis(order.totalPrice.amount, order.totalPrice.currency).toLocaleString('en')}
			SAT {#if priceReference !== 'SAT'}(<PriceTag
					currency={order.totalPrice.currency}
					amount={order.totalPrice.amount}
					convertedTo={priceReference}
				/>){/if}-
			<span
				class={order.payment.status === 'expired' || order.payment.status === 'canceled'
					? 'text-gray-550'
					: order.payment.status === 'paid'
					? 'text-green-500'
					: ''}
			>
				{order.payment.status}</span
			>
			{#if order.totalReceived}
				- received: <PriceTag
					class="inline-flex"
					currency={order.totalReceived.currency}
					amount={order.totalReceived.amount}
				/>
			{/if}
			{#if showForms}
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
