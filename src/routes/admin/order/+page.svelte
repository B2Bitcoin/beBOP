<script lang="ts">
	import { sum } from '$lib/utils/sum.js';

	export let data;
</script>

<main class="p-4 flex flex-col gap-6">
	<h1 class="text-3xl">List of orders</h1>

	<ul class="flex flex-col gap-4">
		{#each data.orders as order}
			<li class="text-lg">
				<a href="/order/{order._id}" class="text-blue hover:underline">#{order.number}</a> - Total: {order.totalPrice.amount.toLocaleString(
					'en',
					{ maximumFractionDigits: 8 }
				)} BTC -
				<span
					class={order.payment.status === 'expired'
						? 'text-gray-550'
						: order.payment.status === 'paid'
						? 'text-green-500'
						: ''}
				>
					{order.payment.status}</span
				>
				- received: {sum(order.payment.transactions?.map((t) => t.amount) ?? []).toLocaleString(
					'en',
					{ maximumFractionDigits: 8 }
				)} BTC
			</li>
		{:else}
			<li>No orders yet</li>
		{/each}
	</ul>
</main>
