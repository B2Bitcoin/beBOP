<script lang="ts">
	import ChallengeWidget from './ChallengeWidget.svelte';
	import CarouselWidget from './CarouselWidget.svelte';
	import type { Challenge } from '$lib/types/Challenge';
	import type { Slider } from '$lib/types/slider';
	import type { Picture } from '$lib/types/Picture';
	import type { Product } from '$lib/types/Product';
	import type { DigitalFile } from '$lib/types/DigitalFile';
	import ProductWidget from './ProductWidget.svelte';
	import { POS_ROLE_ID } from '$lib/types/User';

	export let products: Pick<
		Product,
		| '_id'
		| 'name'
		| 'price'
		| 'shortDescription'
		| 'preorder'
		| 'availableDate'
		| 'shipping'
		| 'type'
		| 'actionSettings'
	>[];
	export let pictures: Picture[];
	export let challenges: Pick<Challenge, '_id' | 'name' | 'goal' | 'progress' | 'endsAt'>[];
	export let tokens: Array<
		| {
				type: 'html';
				raw: string;
		  }
		| {
				type: 'productWidget';
				slug: string;
				display: string | undefined;
				raw: string;
		  }
		| {
				type: 'challengeWidget';
				slug: string;
				raw: string;
		  }
		| {
				type: 'sliderWidget';
				slug: string;
				autoplay: number | undefined;
				raw: string;
		  }
	> = [];
	export let sliders: Slider[];
	export let slidersPictures: Picture[];
	export let digitalFiles: Pick<DigitalFile, '_id' | 'name' | 'productId'>[];
	export let roleId: string;

	$: productById = Object.fromEntries(products.map((product) => [product._id, product]));
	$: pictureByProduct = Object.fromEntries(pictures.map((picture) => [picture.productId, picture]));
	$: digitalFilesByProduct = Object.fromEntries(
		digitalFiles.map((digitalFile) => [digitalFile.productId, digitalFile])
	);
	$: challengeById = Object.fromEntries(challenges.map((challenge) => [challenge._id, challenge]));
	$: sliderById = Object.fromEntries(sliders.map((slider) => [slider._id, slider]));
	function picturesBySlider(sliderId: string) {
		return slidersPictures.filter((picture) => picture.slider?._id === sliderId);
	}
</script>

<div class="prose max-w-full">
	{#each tokens as token}
		{#if token.type === 'productWidget' && productById[token.slug]}
			<ProductWidget
				product={productById[token.slug]}
				picture={pictureByProduct[token.slug]}
				hasDigitalFiles={digitalFilesByProduct[token.slug] !== null}
				displayOption={token.display}
				canBuy={roleId === POS_ROLE_ID
					? productById[token.slug].actionSettings.retail.canBeAddedToBasket
					: productById[token.slug].actionSettings.eShop.canBeAddedToBasket}
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
