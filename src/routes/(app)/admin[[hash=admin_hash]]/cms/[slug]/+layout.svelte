<script lang="ts">
	import TabLinksHeader from '$lib/components/TabLinksHeader.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<TabLinksHeader
	tabs={[
		{ href: `${data.adminPrefix}/cms/${$page.params.slug}`, name: 'Edit CMS page' },
		{
			href: `${data.adminPrefix}/cms/${$page.params.slug}/translations`,
			name: 'Translations'
		}
	]}
/>

<slot />
