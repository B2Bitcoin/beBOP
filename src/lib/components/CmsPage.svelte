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
		CmsContactForm,
		CmsCountdown,
		CmsGallery
	} from '$lib/server/cms';
	import CmsDesign from './CmsDesign.svelte';

	export let cmsPage: {
		title: string;
		shortDescription: string;
		fullScreen: boolean;
		hideFromSEO?: boolean | undefined;
	};
	export let products: CmsProduct[];
	export let pictures: CmsPicture[];
	export let challenges: CmsChallenge[];
	export let tokens: CmsToken[] = [];
	export let sliders: CmsSlider[];
	export let digitalFiles: CmsDigitalFile[];
	export let roleId: string | undefined;
	export let sessionEmail: string | undefined;
	export let pageLink: string | undefined;
	export let pageName: string | undefined;
	export let websiteLink: string | undefined;
	export let brandName: string | undefined;
	export let tags: CmsTag[];
	export let specifications: CmsSpecification[];
	export let contactForms: CmsContactForm[];
	export let countdowns: CmsCountdown[];
	export let galleries: CmsGallery[];
</script>

<svelte:head>
	<title>{cmsPage.title}</title>
	<meta name="description" content={cmsPage.shortDescription} />
	{#if cmsPage.hideFromSEO}
		<meta name="robots" content="noindex" />
	{/if}
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
		{sessionEmail}
		{pageLink}
		{pageName}
		{websiteLink}
		{brandName}
		{countdowns}
		{galleries}
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
			{sessionEmail}
			{pageLink}
			{pageName}
			{websiteLink}
			{brandName}
			{countdowns}
			{galleries}
			class="body"
		/>
	</main>
{/if}
