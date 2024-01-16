<script lang="ts">
	import { page } from '$app/stores';
	import CmsPage from '$lib/components/CmsPage.svelte';
	import { mapKeys } from '$lib/utils/mapKeys.js';

	export let data;
	const lowerVars = mapKeys(
		{
			pageLink: $page.url,
			pageName: data.cmsPage.title,
			websiteLink: data.websiteLink,
			brandName: data.brandName
		},
		(key) => key.toLowerCase()
	);
</script>

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
	contactForms={data.cmsData.contactForms.map((contactForm) => ({
		...contactForm,
		subject: contactForm.subject.replace(/{{([^}]+)}}/g, (match, p1) => {
			return lowerVars[p1.toLowerCase()] || match;
		}),
		content: contactForm.content.replace(/{{([^}]+)}}/g, (match, p1) => {
			return lowerVars[p1.toLowerCase()] || match;
		})
	}))}
	sessionEmail={data.cmsData.sessionEmail}
/>
