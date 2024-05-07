<script lang="ts">
	import { browser } from '$app/environment';
	import CmsPage from '$lib/components/CmsPage.svelte';
	export let data;
</script>

{#if browser && window.innerWidth <= 768 && data.cmsDataSubstitute}
	<CmsPage
		cmsPage={data.cmsPage}
		challenges={data.cmsDataSubstitute.challenges}
		tokens={data.cmsDataSubstitute.tokens}
		sliders={data.cmsDataSubstitute.sliders}
		tags={data.cmsDataSubstitute.tags}
		products={data.cmsDataSubstitute.products}
		pictures={data.cmsDataSubstitute.pictures}
		digitalFiles={data.cmsDataSubstitute.digitalFiles}
		roleId={data.roleId ? data.roleId : ''}
		specifications={data.cmsDataSubstitute.specifications}
		contactForms={data.cmsDataSubstitute.contactForms}
		pageName={data.cmsPage.title}
		websiteLink={data.websiteLink}
		brandName={data.brandName}
		sessionEmail={data.email}
		countdowns={data.cmsDataSubstitute.countdowns}
		galleries={data.cmsDataSubstitute.galleries}
	/>
{:else}
	<CmsPage
		cmsPage={data.cmsPage}
		challenges={data.cmsData.challenges}
		tokens={data.cmsData.tokens}
		sliders={data.cmsData.sliders}
		tags={data.cmsData.tags}
		products={data.cmsData.products}
		pictures={data.cmsData.pictures}
		digitalFiles={data.cmsData.digitalFiles}
		roleId={data.roleId ? data.roleId : ''}
		specifications={data.cmsData.specifications}
		contactForms={data.cmsData.contactForms}
		pageName={data.cmsPage.title}
		websiteLink={data.websiteLink}
		brandName={data.brandName}
		sessionEmail={data.email}
		countdowns={data.cmsData.countdowns}
		galleries={data.cmsData.galleries}
	/>
{/if}
