<script lang="ts">
	import { marked } from 'marked';
	import ProductWidget from '$lib/components/ProductWidget.svelte';

	export let data;

	$: productById = Object.fromEntries(data.products.map((product) => [product._id, product]));
	$: pictureByProduct = Object.fromEntries(
		data.pictures.map((picture) => [picture.productId, picture])
	);
</script>

<svelte:head>
	<title>{data.cmsPage.title}</title>
	<meta name="description" content={data.cmsPage.shortDescription} />
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border p-6">
		<div class="prose max-w-full">
			{#each data.tokens as token}
				{#if token.type === 'productWidget'}
					<ProductWidget
						exchangeRate={data.exchangeRate}
						product={productById[token.slug]}
						picture={pictureByProduct[token.slug]}
					/>
				{:else}
					{@html marked(token.raw)}
				{/if}
			{/each}
		</div>
	</article>
</main>
