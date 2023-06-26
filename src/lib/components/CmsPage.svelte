<script lang="ts">
	import { marked } from 'marked';
	import type { PageData } from '../../routes/[slug]/$types';
	import ProductWidget from './ProductWidget.svelte';
	import ChallengeWidget from './ChallengeWidget.svelte';

	export let products: PageData['products'];
	export let pictures: PageData['pictures'];
	export let challenges: PageData['challenges'];
	export let tokens: PageData['tokens'];
	export let cmsPage: PageData['cmsPage'];
	export let exchangeRate: PageData['exchangeRate'];

	$: productById = Object.fromEntries(products.map((product) => [product._id, product]));
	$: pictureByProduct = Object.fromEntries(pictures.map((picture) => [picture.productId, picture]));
	$: challengeById = Object.fromEntries(challenges.map((challenge) => [challenge._id, challenge]));
</script>

<svelte:head>
	<title>{cmsPage.title}</title>
	<meta name="description" content={cmsPage.shortDescription} />
</svelte:head>

<main class="mx-auto max-w-7xl py-10 px-6">
	<article class="w-full rounded-xl bg-white border-gray-300 border p-6">
		<div class="prose max-w-full">
			{#each tokens as token}
				{#if token.type === 'productWidget'}
					<ProductWidget
						{exchangeRate}
						product={productById[token.slug]}
						picture={pictureByProduct[token.slug]}
						class="not-prose my-5"
					/>
				{:else if token.type === 'challengeWidget'}
					<ChallengeWidget challenge={challengeById[token.slug]} class="my-5" />
				{:else}
					{@html marked(token.raw)}
				{/if}
			{/each}
		</div>
	</article>
</main>
