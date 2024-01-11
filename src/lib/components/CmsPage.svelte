<script lang="ts">
	import type {
		CmsChallenge,
		CmsDigitalFile,
		CmsPicture,
		CmsProduct,
		CmsSlider,
		CmsTag,
		CmsToken,
		CmsSpecification,
		CmsContactForm
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
	export let specifications: CmsSpecification[];
	export let contactForms: CmsContactForm[];
</script>

<svelte:head>
	<title>{cmsPage.title}</title>
	<meta name="description" content={cmsPage.shortDescription} />
</svelte:head>

{#if cmsPage.fullScreen}
	<CmsDesign
		{products}
		{pictures}
		{challenges}
		{tokens}
		{digitalFiles}
		{sliders}
		{tags}
		{roleId}
		{specifications}
		{contactForms}
		class="body body-mainPlan"
	/>
{:else}
	<main class="mx-auto max-w-7xl px-6">
		<CmsDesign
			{products}
			{pictures}
			{challenges}
			{tokens}
			{digitalFiles}
			{sliders}
			{tags}
			{roleId}
			{specifications}
			{contactForms}
			class="body"
		/>
	</main>
{/if}
