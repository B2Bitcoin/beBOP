<script lang="ts">
	import TabLinksHeader from '$lib/components/TabLinksHeader.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<TabLinksHeader
	tabs={[
		{ href: `${data.adminPrefix}/specification/${$page.params.id}`, name: 'Edit Specification' },
		{
			href: `${data.adminPrefix}/cms/${$page.params.slug}/translations`,
			name: 'Translations'
		}
	]}
/>

<slot />
