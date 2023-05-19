<script lang="ts">
	import IconBitcoin from '$lib/components/icons/IconBitcoin.svelte';

	export let data;
</script>

<main class="p-4 flex flex-col gap-6">
	<h1 class="text-3xl">List of orders</h1>

	<ul class="flex flex-col gap-4">
		{#each data.orders as order}
			<li class="text-lg">
				<a href="/order/{order._id}" class="text-blue hover:underline">#{order.number}</a> - {#if order.payment.method === 'bitcoin'}
					<IconBitcoin />
				{:else if order.payment.method === 'lightning'}
					⚡
				{/if} - Total: {order.totalPrice.amount.toLocaleString('en', {
					maximumFractionDigits: 8
				})} BTC -
				<span
					class={order.payment.status === 'expired'
						? 'text-gray-550'
						: order.payment.status === 'paid'
						? 'text-green-500'
						: ''}
				>
					{order.payment.status}</span
				>
				- received: {(order.payment.totalReceived ?? 0).toLocaleString('en', {
					maximumFractionDigits: 8
				})} BTC
			</li>
		{:else}
			<li>No orders yet</li>
		{/each}
	</ul>
</main>
