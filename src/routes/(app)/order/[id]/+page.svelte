<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import ProductItem from '$lib/components/ProductItem.svelte';
	import { UrlDependency } from '$lib/types/UrlDependency.js';
	import { pluralize } from '$lib/utils/pluralize';
	import { toBitcoins } from '$lib/utils/toBitcoins';
	import { toSatoshis } from '$lib/utils/toSatoshis.js';
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

		<div class="flex gap-4">
			{#each data.order.items as item}
				<ProductItem class="relative" picture={item.picture} product={item.product}>
					{#if item.quantity !== 1}
						<span
							class="px-4 py-2 bg-green-600 rounded-bl-lg text-white font-bold absolute top-0 right-0"
							>x{item.quantity}</span
						>
					{/if}
				</ProductItem>
			{/each}
		</div>

		<div class="text-xl flex items-center gap-2">
			Total <PriceTag
				class="text-xl inline-flex"
				gap="gap-1"
				amount={data.order.totalPrice.amount}
				currency={data.order.totalPrice.currency}
				main
			/>
			<PriceTag
				class="text-base inline-flex"
				gap="gap-1"
				amount={data.order.totalPrice.amount}
				currency={data.order.totalPrice.currency}
				secondary
			/>
		</div>

		{#if data.order.notifications?.paymentStatus?.npub}
			<p>
				NostR public address for payment status: <span class="font-mono">
					{data.order.notifications.paymentStatus.npub}</span
				>
			</p>
		{/if}
		{#if data.order.payment.status !== 'expired' && data.order.payment.status !== 'canceled'}
			<div>
				Keep this link: <a class="underline text-link" href={$page.url.href}>{$page.url.href}</a> to
				access the order later.
			</div>
		{/if}

		{#if data.order.payment.status === 'pending'}
			{#if data.order.payment.method === 'cash'}
				<p class="text-xl">Your order awaits confirmation from the seller.</p>
			{:else}
				<ul>
					<li>Payment address: <code class="break-words">{data.order.payment.address}</code></li>
					<li>
						Payment amount: <code class="break-words">
							{(data.order.payment.method === 'bitcoin'
								? toBitcoins(data.order.totalPrice.amount, data.order.totalPrice.currency)
								: toSatoshis(data.order.totalPrice.amount, data.order.totalPrice.currency)
							).toLocaleString('en-US', { maximumFractionDigits: 8 })}
							{data.order.payment.method === 'bitcoin' ? 'BTC' : 'sats'}
						</code>
					</li>
					<li>
						Time remaining: {differenceInMinutes(data.order.payment.expiresAt, currentDate)} minutes
					</li>
				</ul>
				<img src="{$page.url.pathname}/qrcode" class="w-96 h-96" alt="QR code" />
				<div class="text-xl">
					Pay to complete the order. {#if data.order.payment.method === 'bitcoin'}
						Order will be marked as paid after {data.confirmationBlocksRequired}
						{pluralize(data.confirmationBlocksRequired, 'confirmation')}.{/if}
				</div>
			{/if}
		{:else if data.order.payment.status === 'paid'}
			<p>Order <span class="text-green-500">paid</span>!</p>
		{:else if data.order.payment.status === 'expired'}
			<p>Order expired!</p>
		{:else if data.order.payment.status === 'canceled'}
			<p class="font-bold">Order canceled!</p>
		{/if}

		{#if data.digitalFiles.length}
			<h2 class="text-2xl">Digital Files</h2>
			<ul>
				{#each data.digitalFiles as digitalFile}
					<li>
						{#if digitalFile.link}
							<a href={digitalFile.link} class="text-link hover:underline" target="_blank"
								>{digitalFile.name}</a
							>
						{:else}
							{digitalFile.name}
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		<p class="text-base">
			Created at
			<time
				datetime={data.order.createdAt.toJSON()}
				title={data.order.createdAt.toLocaleString('en')}
				>{format(data.order.createdAt, 'dd-MM-yyyy HH:mm:ss')}</time
			>
		</p>

		{#if data.order.payment.status === 'pending'}
			<form method="post" action="?/cancel">
				<button type="submit" class="btn btn-red">Cancel</button>
			</form>
		{/if}
	</article>
</main>
