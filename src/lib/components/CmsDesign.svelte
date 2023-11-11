<script lang="ts">
	import ChallengeWidget from './ChallengeWidget.svelte';
	import CarouselWidget from './CarouselWidget.svelte';
	import type { Picture } from '$lib/types/Picture';
	import ProductWidget from './ProductWidget.svelte';
	import { POS_ROLE_ID } from '$lib/types/User';
	import { groupBy } from 'lodash-es';
	import type { SetRequired } from 'type-fest';
	import TagWidget from './TagWidget.svelte';
	import type {
		CmsChallenge,
		CmsDigitalFile,
		CmsPicture,
		CmsProduct,
		CmsSlider,
		CmsTag,
		CmsToken
	} from '$lib/server/cms';

	export let products: CmsProduct[];
	export let pictures: CmsPicture[];
	export let challenges: CmsChallenge[];
	export let tokens: CmsToken[] = [];
	export let sliders: CmsSlider[];
	export let digitalFiles: CmsDigitalFile[];
	export let roleId: string | undefined;
	export let tags: CmsTag[];
	let classNames = '';
	export { classNames as class };

	$: productById = Object.fromEntries(products.map((product) => [product._id, product]));
	$: pictureByProduct = Object.fromEntries(pictures.map((picture) => [picture.productId, picture]));
	$: digitalFilesByProduct = Object.fromEntries(
		digitalFiles.map((digitalFile) => [digitalFile.productId, digitalFile])
	);
	$: challengeById = Object.fromEntries(challenges.map((challenge) => [challenge._id, challenge]));
	$: sliderById = Object.fromEntries(sliders.map((slider) => [slider._id, slider]));
	$: tagById = Object.fromEntries(tags.map((tag) => [tag._id, tag]));
	$: picturesByTag = groupBy(
		pictures.filter((picture): picture is SetRequired<Picture, 'tag'> => !!picture.tag),
		'tag._id'
	);
	$: picturesBySlider = groupBy(
		pictures.filter((picture): picture is SetRequired<Picture, 'slider'> => !!picture.slider),
		'slider._id'
	);
</script>

<div class="prose max-w-full {classNames}">
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
				pictures={picturesBySlider[token.slug]}
			/>
		{:else if token.type === 'tagWidget' && tagById[token.slug]}
			<TagWidget
				tag={tagById[token.slug]}
				pictures={picturesByTag[token.slug]}
				displayOption={token.display}
				class="not-prose mb-12"
			/>
		{:else}
			{@html token.raw}
		{/if}
	{/each}
</div>
