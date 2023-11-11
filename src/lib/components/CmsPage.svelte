<script lang="ts">
	import type { Challenge } from '$lib/types/Challenge';
	import type { CmsToken } from '$lib/types/CmsPage';
	import type { DigitalFile } from '$lib/types/DigitalFile';
	import type { Picture } from '$lib/types/Picture';
	import type { Product } from '$lib/types/Product';
	import type { Tag } from '$lib/types/Tag';
	import type { Slider } from '$lib/types/slider';
	import CmsDesign from './CmsDesign.svelte';

	export let cmsPage: {
		title: string;
		shortDescription: string;
		fullScreen: boolean;
	};
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
	export let tokens: CmsToken[] = [];
	export let sliders: Slider[];
	export let digitalFiles: Pick<DigitalFile, '_id' | 'name' | 'productId'>[];
	export let roleId: string | undefined;
	export let tags: Tag[];
</script>

<svelte:head>
	<title>{cmsPage.title}</title>
	<meta name="description" content={cmsPage.shortDescription} />
</svelte:head>

{#if cmsPage.fullScreen}
	<CmsDesign {products} {pictures} {challenges} {tokens} {digitalFiles} {sliders} {tags} {roleId} />
{:else}
	<main class="mx-auto max-w-7xl py-10 px-6">
		<article class="w-full rounded-xl bg-white border-gray-300 border p-6">
			<CmsDesign
				{products}
				{pictures}
				{challenges}
				{tokens}
				{digitalFiles}
				{sliders}
				{tags}
				{roleId}
			/>
		</article>
	</main>
{/if}
