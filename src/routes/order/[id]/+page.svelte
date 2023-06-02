<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import { UrlDependency } from '$lib/types/UrlDependency.js';
	import { pluralize } from '$lib/utils/pluralize';
	import { differenceInMinutes, format } from 'date-fns';
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

		<div class="text-xl flex items-center gap-2">
			Total <PriceTag
				class="text-xl inline-flex"
				gap="gap-1"
				amount={data.order.totalPrice.amount}
				currency={data.order.totalPrice.currency}
				rawBtc
			/>
		</div>

		{#if data.order.payment.status !== 'expired'}
			<div>
				Keep this link: <a class="underline text-blue" href={$page.url.href}>{$page.url.href}</a> to
				access the order later.
			</div>
		{/if}

		{#if data.order.payment.status === 'pending'}
			<ul>
				<li>Payment address: <code class="break-words">{data.order.payment.address}</code></li>
				{#if data.order.notifications?.paymentStatus?.npub}
					<li>
						NostR public address for payment status: {data.order.notifications.paymentStatus.npub}
					</li>
				{/if}
				<li>
					Time remaining: {differenceInMinutes(data.order.payment.expiresAt, currentDate)} minutes
				</li>
			</ul>
			<img src="{$page.url.pathname}/qrcode" class="w-40 h-40" alt="QR code" />
			<div class="text-xl">
				Pay to to complete the order. {#if data.order.payment.method === 'bitcoin'}
					Order will be marked as paid after {pluralize(
						data.confirmationBlocksRequired,
						'confirmation'
					)}.{/if}
			</div>
		{:else if data.order.payment.status === 'paid'}
			<p>Order <span class="text-green-500">paid</span>!</p>
		{:else if data.order.payment.status === 'expired'}
			<p>Order expired!</p>
		{/if}

		{#if data.digitalFiles.length}
			<h2 class="text-2xl">Digital Files</h2>
			<ul>
				{#each data.digitalFiles as digitalFile}
					<li>
						{#if digitalFile.link}
							<a href={digitalFile.link} class="text-blue hover:underline" target="_blank"
								>{digitalFile.name}</a
							>
						{:else}
							{digitalFile.name}
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		<p class="text-xl">
			Created at
			<time
				datetime={data.order.createdAt.toJSON()}
				title={data.order.createdAt.toLocaleString('en')}
				>{format(data.order.createdAt, 'dd-MM-yyyy HH:mm:ss')}</time
			>
		</p>
	</article>
</main>
