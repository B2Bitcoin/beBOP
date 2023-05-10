<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { UrlDependency } from '$lib/types/UrlDependency.js';
	import { differenceInMinutes } from 'date-fns';
	import { onMount } from 'svelte';

	let currentDate = new Date();
	export let data;

	let count = 0;

	onMount(() => {
		const interval = setInterval(() => {
			currentDate = new Date();

			if (data.order.payment.status === 'pending') {
				count++;
				if (count % 4 === 0) {
					invalidate(UrlDependency.Order);
				}
			}
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border py-3 px-3 flex flex-col gap-2">
		<h1 class="text-3xl">Order #{data.order.number}</h1>

		<ul>
			{#each data.order.items as item}
				<li>
					{item.product.name}
					{#if item.quantity > 1} * {item.quantity} {/if}
				</li>
			{/each}
		</ul>

		<div class="text-xl">
			Total <PriceTag
				class="text-xl inline-flex"
				gap="gap-1"
				amount={data.order.totalPrice.amount}
				currency={data.order.totalPrice.currency}
				rawBtc
			/>
		</div>

		{#if data.order.payment.status === 'pending'}
			<ul>
				<li>Payment address: <code>{data.order.payment.address}</code></li>
				<li>
					Time remaining: {differenceInMinutes(data.order.payment.expiresAt, currentDate)} minutes
				</li>
			</ul>
			<img src="{$page.url.pathname}/qrcode" class="w-40 h-40" alt="QR code" />
			<div class="text-xl">
				Pay to to complete the order. Order will be marked as paid after 1 confirmation.
			</div>
		{:else if data.order.payment.status === 'paid'}
			Order paid!
		{:else if data.order.payment.status === 'expired'}
			Order expired!
		{/if}
	</article>
</main>
