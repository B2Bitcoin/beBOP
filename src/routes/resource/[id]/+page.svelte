<script lang="ts">
	import { page } from '$app/stores';
	import Picture from '$lib/components/Picture.svelte';
	import PriceTag from '$lib/components/PriceTag.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: currentPicture = data.pictures[0];
</script>

<svelte:head>
	<title>{data.product.name}</title>
	{#if data.product.shortDescription}
		<meta name="description" content={data.product.shortDescription} />
		<meta property="og:description" content={data.product.shortDescription} />
	{/if}
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
	<meta property="og:type" content="og:product" />
	<meta property="og:title" content={data.product.name} />
	{#if currentPicture}
		<meta
			property="og:image"
			content="{$page.url.origin}/picture/raw/${currentPicture._id}/format/${currentPicture.storage
				.formats[0].width}"
		/>
	{/if}
	<meta property="product:price:amount" content={data.product.price.amount} />
	<meta property="product:price:currency" content={data.product.price.currency} />
	<meta property="og:type" content="og:product" />
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<nav class="flex gap-2 text-gray-700 font-light">
		<a href="/" class="hover:underline">Home</a>
		&gt;
		<a href="/resource" class="hover:underline">Resources</a>
		&gt;
		<a href={$page.url.pathname} class="hover:underline font-semibold">{data.product.name}</a>
	</nav>
	<div class="mt-2 w-full rounded-xl bg-white border-gray-300 border-[1px] py-3 px-3 flex gap-2">
		<div class="flex flex-col gap-2 w-12 min-w-[48px]">
			{#each data.pictures as picture}
				<Picture
					{picture}
					class="h-12 w-12 rounded-sm {picture === currentPicture
						? 'ring-2 ring-blue-500 ring-offset-2'
						: ''} cursor-pointer"
					on:click={() => (currentPicture = picture)}
				/>
			{/each}
		</div>
		<div class="grid grid-cols-[70%_1fr] gap-2 grow">
			<div class="aspect-video">
				<Picture picture={currentPicture} class="h-full object-cover mx-auto rounded" />
			</div>
			<div class="flex flex-col">
				<PriceTag
					currency={data.product.price.currency}
					class="ml-auto text-4xl"
					amount={data.product.price.amount}
				/>
				<PriceTag
					currency={data.product.price.currency}
					amount={data.product.price.amount}
					convertedTo="EUR"
					exchangeRate={data.exchangeRate}
					class="ml-auto text-xl"
				/>
			</div>
		</div>
	</div>
</main>
