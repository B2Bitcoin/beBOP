<script lang="ts">
	import IconBitcoin from '$lib/components/icons/IconBitcoin.svelte';
	import { toSatoshis } from '$lib/utils/toSatoshis';

	export let data;
	import { formatDistance } from 'date-fns';
</script>

<h1 class="text-3xl">List of orders</h1>

<ul class="flex flex-col gap-4">
	{#each data.orders as order}
		<li class="text-lg flex items-center gap-1">
			<a href="/order/{order._id}" class="text-link hover:underline">#{order.number}</a>
			- {#if order.payment.method === 'bitcoin'}
				<IconBitcoin />
			{:else if order.payment.method === 'lightning'}
				⚡
			{/if} -
			<time datetime={order.createdAt.toJSON()} title={order.createdAt.toLocaleString('en')}
				>{formatDistance(order.createdAt, Date.now(), {
					addSuffix: true
				})}</time
			>
			- Total: {toSatoshis(order.totalPrice.amount, order.totalPrice.currency).toLocaleString('en')}
			SAT -
			<span
				class={order.payment.status === 'expired' || order.payment.status === 'canceled'
					? 'text-gray-550'
					: order.payment.status === 'paid'
					? 'text-green-500'
					: ''}
			>
				{order.payment.status}</span
			>
			- received: {(order.payment.totalReceived ?? 0).toLocaleString('en')}
			SAT
		</li>
	{:else}
		<li>No orders yet</li>
	{/each}
</ul>
