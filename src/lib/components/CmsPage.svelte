<script lang="ts">
	import type {
		CmsChallenge,
		CmsDigitalFile,
		CmsPicture,
		CmsProduct,
		CmsSlider,
		CmsTag,
		CmsToken
	} from '$lib/server/cms';
	import CmsDesign from './CmsDesign.svelte';

	export let cmsPage: {
		title: string;
		shortDescription: string;
		fullScreen: boolean;
	};
	export let products: CmsProduct[];
	export let pictures: CmsPicture[];
	export let challenges: CmsChallenge[];
	export let tokens: CmsToken[] = [];
	export let sliders: CmsSlider[];
	export let digitalFiles: CmsDigitalFile[];
	export let roleId: string | undefined;
	export let tags: CmsTag[];
</script>

<svelte:head>
	<title>{cmsPage.title}</title>
	<meta name="description" content={cmsPage.shortDescription} />
</svelte:head>

{#if cmsPage.fullScreen}
	<CmsDesign {products} {pictures} {challenges} {tokens} {digitalFiles} {sliders} {tags} {roleId} />
{:else}
	<main class="mx-auto max-w-7xl py-10 px-6">
<!--		<article class="w-full rounded-xl bg-white border-gray-300 border p-6"> -->
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
<!--		</article> -->
	</main>
{/if}
