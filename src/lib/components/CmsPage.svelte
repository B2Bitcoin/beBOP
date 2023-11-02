<script lang="ts">
	import type { PageData } from '../../routes/(app)/[slug]/$types';
	import ProductWidget from './ProductWidget.svelte';
	import ChallengeWidget from './ChallengeWidget.svelte';
	import CarouselWidget from './CarouselWidget.svelte';

	export let products: PageData['products'];
	export let pictures: PageData['pictures'];
	export let challenges: PageData['challenges'];
	export let tokens: PageData['tokens'];
	export let cmsPage: PageData['cmsPage'];
	export let digitalFiles: PageData['digitalFiles'];
	export let sliders: PageData['sliders'];
	export let slidersPictures: PageData['slidersPictures'];

	$: productById = Object.fromEntries(products.map((product) => [product._id, product]));
	$: pictureByProduct = Object.fromEntries(pictures.map((picture) => [picture.productId, picture]));
	$: challengeById = Object.fromEntries(challenges.map((challenge) => [challenge._id, challenge]));
	$: digitalFilesByProduct = Object.fromEntries(
		digitalFiles.map((digitalFile) => [digitalFile.productId, digitalFile])
	);
	$: sliderById = Object.fromEntries(sliders.map((slider) => [slider._id, slider]));
	function picturesBySlider(sliderId: string) {
		return slidersPictures.filter((picture) => picture.slider?._id === sliderId);
	}
</script>

<svelte:head>
	<title>{cmsPage.title}</title>
	<meta name="description" content={cmsPage.shortDescription} />
</svelte:head>

{#if cmsPage.fullScreen}
	<article class="prose max-w-full">
		{#each tokens as token}
			{#if token.type === 'productWidget' && productById[token.slug]}
				<ProductWidget
					product={productById[token.slug]}
					picture={pictureByProduct[token.slug]}
					hasDigitalFiles={digitalFilesByProduct[token.slug] !== null}
					displayOption={token.display}
					class="not-prose my-5"
				/>
			{:else if token.type === 'challengeWidget' && challengeById[token.slug]}
				<ChallengeWidget challenge={challengeById[token.slug]} class="my-5" />
			{:else if token.type === 'sliderWidget' && sliderById[token.slug]}
				<CarouselWidget
					autoplay={token.autoplay ? token.autoplay : 3000}
					pictures={picturesBySlider(token.slug)}
				/>
			{:else}
				{@html token.raw}
			{/if}
		{/each}
	</article>
{:else}
	<main class="mx-auto max-w-7xl py-10 px-6">
		<article class="w-full rounded-xl bg-white border-gray-300 border p-6">
			<div class="prose max-w-full">
				{#each tokens as token}
					{#if token.type === 'productWidget' && productById[token.slug]}
						<ProductWidget
							product={productById[token.slug]}
							picture={pictureByProduct[token.slug]}
							hasDigitalFiles={digitalFilesByProduct[token.slug] !== null}
							displayOption={token.display}
							class="not-prose my-5"
						/>
					{:else if token.type === 'challengeWidget' && challengeById[token.slug]}
						<ChallengeWidget challenge={challengeById[token.slug]} class="my-5" />
					{:else if token.type === 'sliderWidget' && sliderById[token.slug]}
						<CarouselWidget
							autoplay={token.autoplay ? token.autoplay : 3000}
							pictures={picturesBySlider(token.slug)}
						/>
					{:else}
						{@html token.raw}
					{/if}
				{/each}
			</div>
		</article>
	</main>
{/if}
