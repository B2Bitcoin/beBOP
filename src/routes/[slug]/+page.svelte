<script lang="ts">
	import { marked } from 'marked';
	import ProductWidget from '$lib/components/ProductWidget.svelte';
	import ChallengeWidget from '$lib/components/ChallengeWidget.svelte';

	export let data;

	$: productById = Object.fromEntries(data.products.map((product) => [product._id, product]));
	$: challengeById = Object.fromEntries(
		data.challenges.map((challenge) => [challenge._id, challenge])
	);
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
				{#each token.type as type}
					{#if type === 'productWidget'}
						<ProductWidget
							exchangeRate={data.exchangeRate}
							product={productById[token.slug]}
							picture={pictureByProduct[token.slug]}
							class="not-prose my-5"
						/>
					{:else if type === 'challengeWidget'}
						<ChallengeWidget challenge={challengeById[token.id]} />
					{:else}
						{@html marked(token.raw)}
					{/if}
				{/each}
			{/each}
		</div>
	</article>
</main>
