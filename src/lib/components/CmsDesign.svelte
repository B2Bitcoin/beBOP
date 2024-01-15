<script lang="ts">
	import ChallengeWidget from './ChallengeWidget.svelte';
	import CarouselWidget from './CarouselWidget.svelte';
	import PictureComponent from './Picture.svelte';
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
		CmsSpecification,
		CmsTag,
		CmsToken,
		CmsContactForm
	} from '$lib/server/cms';
	import SpecificationWidget from './SpecificationWidget.svelte';
	import ContactForm from './ContactForm.svelte';

	export let products: CmsProduct[];
	export let pictures: CmsPicture[];
	export let challenges: CmsChallenge[];
	export let tokens: CmsToken[] = [];
	export let sliders: CmsSlider[];
	export let digitalFiles: CmsDigitalFile[];
	export let roleId: string | undefined;
	export let sessionEmail: string | undefined;
	export let tags: CmsTag[];
	export let specifications: CmsSpecification[];
	export let contactForms: CmsContactForm[];
	let classNames = '';
	export { classNames as class };

	$: productById = Object.fromEntries(products.map((product) => [product._id, product]));
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
	$: picturesByProduct = groupBy(
		pictures.filter((picture): picture is SetRequired<Picture, 'productId'> => !!picture.productId),
		'productId'
	);
	$: pictureById = Object.fromEntries(pictures.map((picture) => [picture._id, picture]));
	$: specificationById = Object.fromEntries(
		specifications.map((specification) => [specification._id, specification])
	);
	$: contactFormById = Object.fromEntries(
		contactForms.map((contactForm) => [contactForm._id, contactForm])
	);
</script>

<div class="prose max-w-full {classNames}">
	{#each tokens as token}
		{#if token.type === 'productWidget' && productById[token.slug]}
			<ProductWidget
				product={productById[token.slug]}
				pictures={picturesByProduct[token.slug]}
				hasDigitalFiles={digitalFilesByProduct[token.slug] !== null}
				displayOption={token.display}
				canBuy={roleId === POS_ROLE_ID
					? productById[token.slug].actionSettings.retail.canBeAddedToBasket
					: productById[token.slug].actionSettings.eShop.canBeAddedToBasket}
				class="not-prose my-5"
			/>
		{:else if token.type === 'challengeWidget' && challengeById[token.slug]}
			<ChallengeWidget challenge={challengeById[token.slug]} class="not-prose my-5" />
		{:else if token.type === 'sliderWidget' && sliderById[token.slug]}
			<CarouselWidget
				autoplay={token.autoplay ? token.autoplay : 3000}
				pictures={picturesBySlider[token.slug]}
				class="not-prose mx-auto my-5"
			/>
		{:else if token.type === 'tagWidget' && tagById[token.slug]}
			<TagWidget
				tag={tagById[token.slug]}
				pictures={picturesByTag[token.slug]}
				displayOption={token.display}
				class="not-prose my-5"
			/>
		{:else if token.type === 'specificationWidget' && specificationById[token.slug]}
			<SpecificationWidget specification={specificationById[token.slug]} class="not-prose my-5" />
<<<<<<< HEAD
		{:else if token.type === 'contactFormWidget' && contactFormById[token.slug]}
			<ContactForm
				contactForm={contactFormById[token.slug]}
				{sessionEmail}
				class="not-prose my-5"
=======
		{:else if token.type === 'pictureWidget'}
			<PictureComponent
				picture={pictureById[token.slug]}
				class="my-5 {token.height ? `h-[${token.height}px]` : ''} {token.width
					? `w-[${token.width}px]`
					: ''}"
				style="{token.fit ? `object-fit: ${token.fit};` : ''}{token.width
					? `width: ${token.width}px;`
					: ''}{token.height ? `height: ${token.height}px;` : ''}"
>>>>>>> cf1b0cd4f900873b04594f4080bc2c29faa55ba2
			/>
		{:else}
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html token.raw}
		{/if}
	{/each}
</div>
